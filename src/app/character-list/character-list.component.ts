import {   Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit } from '@angular/core';
  import { Observable, Subject } from "rxjs";
  import {MatDialogRef } from "@angular/material/dialog";
  import {MatTableDataSource} from '@angular/material/table';
  import {MatPaginator} from '@angular/material/paginator';
  import {MatDialog} from '@angular/material/dialog';
  import { HttpClient } from "@angular/common/http";
  import{map} from "rxjs/operators"
  // import "rxjs/add/operator/map";
  import { debounceTime } from "rxjs/operators";
  // import "rxjs/add/operator/debounceTime";
  // import "rxjs/add/operator/distinctUntilChanged";
  // import "rxjs/add/operator/switchMap";
  import { distinctUntilChanged } from "rxjs/operators";
  import { switchMap } from "rxjs/operators";


  import { DialogComponent } from "../dialog/dialog.component";



export interface Origin {
  [key: string]: any;
}

export interface Location {
  [key: string]: any;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: Origin;
  location: Location;
  image: string;
  episode: any[];
  url: string;
  created: Date;
}

export interface HttpRequest {
  info: {
    count: number;
    pages: number;
    next: string;
    prev: string;
  };
  results: Character[];
}

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})

export class CharacterListComponent implements OnInit,  AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  characters$: Observable<any>;
  characterDataSource: MatTableDataSource<Character[]>;
  characterDatabase = new HttpDatabase(this.httpClient);
  searchTerm$ = new Subject<string>();
  status = "";
  resultsLength = 0;

 
  dialogRef: MatDialogRef<DialogComponent>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private httpClient: HttpClient,
    public dialog: MatDialog,
  ) {
    this.characterDatabase
      .search(this.searchTerm$)
      .subscribe((response: any) => {
        this.resultsLength = response.info.count;
        this.characterDataSource = new MatTableDataSource(response.results);
        this.characterDataSource.paginator = this.paginator;
        this.characters$ = this.characterDataSource.connect();
        console.log("Response", response);
      });

  }
  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.characterDatabase
        .getCharacters("", "", this.paginator.pageIndex)
        .subscribe((response: any) => {
          this.characterDataSource = new MatTableDataSource(response.results);
          this.resultsLength = response.info.count;
          // this.characterDataSource.paginator = this.paginator;
          this.characters$ = this.characterDataSource.connect();
        });
    });
  }

  ngOnInit() {
    this.characterDatabase.getCharacters().subscribe((response: any) => {
      this.characterDataSource = new MatTableDataSource(response.results);
      this.resultsLength = response.info.count;
      this.characterDataSource.paginator = this.paginator;
      this.characters$ = this.characterDataSource.connect();
    });
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    if (this.characterDataSource) {
      this.characterDataSource.disconnect();
    }
  }

  openDialog(char: any) {
    this.dialogRef = this.dialog.open(DialogComponent, {
      data: {
        c: char
      }
    });

    this.dialogRef.afterClosed().subscribe((res: string) => {
      if (!res) {
        return;
      }
      this.searchTerm$.next(res);
    });
  }

  applyFilter() {
    const filterValue = this.status;
    this.characterDataSource.filter = filterValue.trim().toLowerCase();
    // this.characterDataSource.paginator = this.paginator;
    // if (this.characterDataSource.paginator) {
    //   this.characterDataSource.paginator.firstPage();
    // }
  }

  setStatusColor(status: string) {
    if (status === "Alive") {
      return "#55CC44";
    }
    if (status === "Dead") {
      return "red";
    }
    return "grey";
  }
}


export class HttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  search(terms: Observable<string>) {
    return terms
    .pipe(debounceTime(400), 
    distinctUntilChanged(),
    switchMap(term => this.getCharacters(term)) );
  }

  getCharacters(
    name: string = "",
    status: string = "",
    page: number = 0
  ): Observable<HttpRequest> {
    const href = "https://rickandmortyapi.com/api/character";
    const requestUrl = `${href}?name=${name}&status=${status}&page=${page + 1}`;

    return this._httpClient.get<HttpRequest>(requestUrl);
  }
}