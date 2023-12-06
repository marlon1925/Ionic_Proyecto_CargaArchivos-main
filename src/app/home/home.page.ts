import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // File upload task
  fileUploadTask: AngularFireUploadTask;
  // Upload progress
  percentageVal: Observable<any>;
  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;
  // Uploaded File URL
  UploadedImageURL: Observable<string>;
  // Uploaded image collection
  files: Observable<imgFile[]>;
  // Image specifications
  imgName: string;
  imgSize: number;
  // File uploading status
  isFileUploading: boolean;
  isFileUploaded: boolean;
  private filesCollection: AngularFirestoreCollection<imgFile>;
  fileName: any;
  uploadedFileURL: Observable<any>;
  fileSize: any;
  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    this.isFileUploading = false;
    this.isFileUploaded = false;
    // Define uploaded files collection
    this.filesCollection = afs.collection<imgFile>('imagesCollection');
    this.files = this.filesCollection.valueChanges();
  }
  // Carga de imagenes
  uploadImage(event: FileList) {
    const file: any = event.item(0);
    // Image validation
    if (file.type.split('/')[0] !== 'image') {
      console.log('File type is not supported!');
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.imgName = file.name;
    // Storage path
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    // Image reference
    const imageRef = this.afStorage.ref(fileStoragePath);
    // File upload task
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
    // Show uploading progress
    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
      finalize(() => {
        // Retreive uploaded image storage path
        this.UploadedImageURL = imageRef.getDownloadURL();
        this.UploadedImageURL.subscribe(
          (resp) => {
            this.storeFilesFirebase({
              name: file.name,
              filepath: resp,
              size: this.imgSize,
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          },
          (error) => {
            console.log(error);
          }
        );
      }),
      tap((snap: any) => {
        this.imgSize = snap.totalBytes;
      })
    );
  }
  storeFilesFirebase(image: imgFile) {
    const fileId = this.afs.createId();
    this.filesCollection
      .doc(fileId)
      .set(image)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Carga de archivos pdf
  uploadFile(event: FileList) {
    const file: any = event.item(0);
    // Validación del archivo PDF
    if (file.type !== 'application/pdf') {
      console.log('Solo se permiten archivos PDF.');
      return;
    }
  
    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.fileName = file.name;
  
    // Ruta de almacenamiento en Firebase Storage
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
  
    // Referencia al archivo en Firebase Storage
    const fileRef = this.afStorage.ref(fileStoragePath);
  
    // Tarea de carga del archivo
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
  
    // Mostrar el progreso de carga
    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
      finalize(() => {
        // Obtener la URL del archivo cargado
        this.uploadedFileURL = fileRef.getDownloadURL();
        this.uploadedFileURL.subscribe(
          (url) => {
            this.storeFileMetadataInFirestore({
              name: file.name,
              filepath: url,
              size: file.size,
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          },
          (error) => {
            console.error('Error al obtener la URL del archivo:', error);
          }
        );
      }),
      tap((snapshot: any) => {
        this.fileSize = snapshot.totalBytes;
      })
    );
  }
  
  storeFileMetadataInFirestore(file: imgFile) {
    const fileId = this.afs.createId();
    this.filesCollection
      .doc(fileId)
      .set(file)
      .then(() => {
        console.log('Metadatos del archivo almacenados en Firestore.');
      })
      .catch((error) => {
        console.error('Error al almacenar metadatos en Firestore:', error);
      });
  }

  // Subir archivos .txt
  // Carga de archivos txt
uploadTextFile(event: FileList) {
  const file: any = event.item(0);
  // Validación del archivo de texto (.txt)
  if (file.type !== 'text/plain') {
    console.log('Solo se permiten archivos de texto (.txt).');
    return;
  }

  this.isFileUploading = true;
  this.isFileUploaded = false;
  this.fileName = file.name;

  // Ruta de almacenamiento en Firebase Storage
  const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;

  // Referencia al archivo en Firebase Storage
  const fileRef = this.afStorage.ref(fileStoragePath);

  // Tarea de carga del archivo
  this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);

  // Mostrar el progreso de carga
  this.percentageVal = this.fileUploadTask.percentageChanges();
  this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
    finalize(() => {
      // Obtener la URL del archivo cargado
      this.uploadedFileURL = fileRef.getDownloadURL();
      this.uploadedFileURL.subscribe(
        (url) => {
          this.storeFileMetadataInFirestore({
            name: file.name,
            filepath: url,
            size: file.size,
          });
          this.isFileUploading = false;
          this.isFileUploaded = true;
        },
        (error) => {
          console.error('Error al obtener la URL del archivo:', error);
        }
      );
    }),
    tap((snapshot: any) => {
      this.fileSize = snapshot.totalBytes;
    })
  );
}

// storeFileMetadataInFirestore(file: imgFile) {
//   const fileId = this.afs.createId();
//   this.filesCollection
//     .doc(fileId)
//     .set(file)
//     .then(() => {
//       console.log('Metadatos del archivo almacenados en Firestore.');
//     })
//     .catch((error) => {
//       console.error('Error al almacenar metadatos en Firestore:', error);
//     });
// }


}