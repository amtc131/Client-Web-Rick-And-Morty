import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Character } from 'src/app/Dtos/Character';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  private url ='http://localhost:8080/v1/api/';

  constructor(private http: HttpClient) { }

  getCharacter(): Observable<any>{
    return this.http.get<Character[]>(`${this.url}` + 'allcharacter');
  }
}