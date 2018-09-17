import { Injectable } from "@angular/core";
import { ToastController } from "ionic-angular";
import PouchDB from "pouchdb";
import PouchdbAuthentication from "pouchdb-authentication";
import { SettingInterface } from "../../types";
PouchDB.plugin(PouchdbAuthentication);

@Injectable()
export class SmsDatabaseProvider {
  data: any;
  db: any = null;
  remote: any;
  sync: any = null;

  constructor(private toastCtrl: ToastController) {}

  async initDatabase(setting: SettingInterface): Promise<boolean> {
    // remove old database first
    if (this.sync) {
      this.sync.cancel();
      delete this.sync;
    }
    if (this.db) {
      delete this.db;
    }

    const COUCHDB_URL = `http://${setting.serverAddress}:${
      setting.serverPort
    }/${setting.databaseName}`;

    this.db = new PouchDB(setting.databaseName);
    const remote = new PouchDB(COUCHDB_URL, { skip_setup: true });

    try {
      console.log("connecting to", setting.serverAddress);
      await remote.logIn(setting.userName, setting.password);
    } catch (error) {
      console.log("Connection faild", JSON.stringify(error));
      return false;
    }
    console.log("Connected successfully to ", COUCHDB_URL);
    let options = {
      live: true,
      retry: true,
      continuous: true,
      batch_size: 5120
    };
    this.sync = this.db.sync(remote, options);
    return true;
  }

  isConnected(): boolean {
    return this.sync !== null;
  }

  getAttachment(docId, attachmentId): Promise<Blob> {
    return this.db.getAttachment(docId, attachmentId);
  }

  showToast(msg) {
    const toast = this.toastCtrl.create({ message: msg, duration: 3000 });
    toast.present;
  }

  findAll() {
    this.showToast("Fetching messages list");
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.db
        .allDocs({
          include_docs: true
          // attachments: true,
        })
        .then(result => {
          this.data = [];
          let docs = result.rows.map(row => {
            this.data.push(row.doc);
          });

          resolve(this.data);

          this.db
            .changes({ live: true, since: "now", include_docs: true })
            .on("change", change => {
              this.handleChange(change);
            });
        })
        .catch(error => {
          this.showToast("Error while loading messages");
          console.log(error);
        });
    });
  }

  async create(message) {
    try {
      // replace id with uuid, becauese phone message id is like 1,2,3,4,etc which may make confilictes
      message._id = this.generateUUID();
      return await this.db.post(message);
    } catch (error) {
      this.showToast("error while adding new message");
      throw error;
    }
  }

  async update(message) {
    try {
      return await this.db.put(message);
    } catch (error) {
      this.showToast("Error while updating message");
      throw error;
    }
  }

  async delete(message) {
    try {
      await this.db.remove(message);
    } catch (error) {
      this.showToast("Error while deleting message");
      throw error;
    }
  }

  handleChange(change) {
    let changedDoc = null;
    let changedIndex = null;

    this.data.forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }
    });

    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
      this.showToast(`${changedDoc._id} removed from db`);
    } else {
      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
        this.showToast(`${changedDoc._id} updaed `);
      }

      //A document was added
      else {
        this.data.push(change.doc);
        this.showToast(`${change._id} added`);
      }
    }

    console.log(this.data);
  }

  // https://gist.github.com/antonioaguilar/6135f84658328d399ed656ba3169e558
  generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
      c
    ) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
}
