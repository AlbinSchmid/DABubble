import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FormDataService {
  private formDataSubject = new BehaviorSubject<object>({});
  currentFormData = this.formDataSubject.asObservable();

  updateFormData(data: object) {
    this.formDataSubject.next(data);
  }

  updateAvatar(avatar: string) {
    const currentData = this.formDataSubject.getValue();
    this.formDataSubject.next({ ...currentData, avatar }); // Merge the new avatar with existing form data
  }
}
