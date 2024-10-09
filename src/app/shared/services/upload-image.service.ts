import { EventEmitter, inject, Injectable } from '@angular/core';
import { updateProfile } from '@angular/fire/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { AuthserviceService } from '../../landing-page/services/authservice.service';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {
  storage = getStorage();
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  authService = inject(AuthserviceService);
  avatarChanged = new EventEmitter<string | null>();
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
        this.avatarChanged.emit(this.filePreview); // Emit the new file preview
      };
      reader.readAsDataURL(file);
    }
  }

  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 300;
          const maxHeight = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: file.type });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          }, file.type, 0.5);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async uploadUserAvatar(file: File): Promise<string> {
    try {
      const compressedFile = await this.compressImage(file);
      const storageRef = ref(this.storage, `avatars/${compressedFile.name}`);
      await uploadBytes(storageRef, compressedFile);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  async updateUserAvatar(avatarUrl: string) {
    const currentUser = this.authService.firebaseAuth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { photoURL: avatarUrl });
        console.log('Avatar updated successfully');
      } catch (error) {
        console.error('Error updating avatar:', error);
        throw error;
      }
    } else {
      return Promise.reject('No user logged in');
    }
  }

  async saveAndSetUserAvatar(file: File | null, tempUserData: any) {
    if (file) {
      const avatarUrl = await this.uploadUserAvatar(file);
      tempUserData.avatar = avatarUrl;
    }
    await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
  }

 
}
