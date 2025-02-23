import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:9999/api/v1/ftl';

  constructor(private http: HttpClient) {}

  renderTemplate(templateContent: string, data: string): Observable<string> {
    const request = { "templateContent": templateContent, "values": data };
    return this.http.post<string>(`${this.apiUrl}/render`, request);
  }
}
