import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageParserService {

  constructor() { }
  parseMessage(message: string): string {
    const regex = /\[File: (.*?)\]\((https?:\/\/[^\s]+)\)/g;
    return message.replace(regex, (match, fileName, url) => {
        return `<div>
                    <img src="${url}" target="_blank" alt="${fileName}" width="48px" height="48px"/><br/>
                    <a href="${url}" target="_blank">${fileName}</a>
                </div>`;
    });
  }
}
