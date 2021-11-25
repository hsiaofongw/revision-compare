import { Component, Input, OnInit } from '@angular/core';
import { EditScript, RevisionCompareService } from '../revision-compare.service';
import { select as d3Select } from 'd3';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-revision-compare',
  templateUrl: './revision-compare.component.html',
  styleUrls: ['./revision-compare.component.scss']
})
export class RevisionCompareComponent {
  @Input()
  currentVerisonText?: string;

  @Input()
  previousVersionText?: string;

  _currentLines: string[] = [];
  _previousLines: string[] = [];

  _dragSubscriptions: Subscription[] = [];

  _previousFile?: File;
  _currentFile?: File;

  _fileNamePlaceHolderText = '请将文件拖拽至浏览器窗口内';

  _editScript: EditScript = [];

  constructor(private revisionCompare: RevisionCompareService) { }

  private _getFilesFromDragEvent(dragEvent: DragEvent): FileList | null {
    return dragEvent.dataTransfer?.files ?? null;
  }

  handleDragEnter(event: Event): void {
    // const files = this._getFilesFromDragEvent(event as DragEvent);
    const transfer = (event as DragEvent).dataTransfer;
    if (transfer) {
      transfer.effectAllowed = 'all';
    }
    // console.log({ enter: event, files });
    // console.log(files);

    // this._previousFileName = this._previousFileNamePrompt;

    // if (this._previousFileName===undefined) {
    //   this._previousFileName = this._dropPrompt;
    // }

    // if (this._currentFileName===undefined) {
    //   this._currentFileName = this._dropPrompt;
    // }
  }

  handleDragOver(event: Event): void {
    event.preventDefault();
  }

  handleDragLeave(event: Event): void {
    // console.log({leave: event});
    // event.preventDefault();
    // console.log({ leave: event });
    this._previousFile = undefined;
    this._currentFile = undefined;
  }

  handleDragEnd(event: Event): void {
    // event.preventDefault();
  }

  handleDrop(event: Event): void {
    event.preventDefault();
    const files = this._getFilesFromDragEvent(event as DragEvent);
    // console.log({ drop: event, files });
    // console.log(files);

    if (files?.length === 1) {
      if (this._previousFile === undefined) {
        this._previousFile = files[0];
      }
      else if (this._currentFile === undefined) {
        this._currentFile = files[0];
      }
    }

    if (files?.length === 2) {
      const sortedFiles = [];
      sortedFiles[0] = files[0];
      sortedFiles[1] = files[1];
      sortedFiles.sort((a, b) => a.lastModified - b.lastModified);
      this._previousFile = sortedFiles[0];
      this._currentFile = sortedFiles[1];
    }
  }

  ngOnChanges(): void {
    if (this.currentVerisonText) {
      this._currentLines = this.currentVerisonText.split('\n');
    }
    if (this.previousVersionText) {
      this._previousLines = this.previousVersionText.split('\n');
    }

    const origin = ['a','b','c','a','b','b','a'];
    const current = ['c','b','a','b','a','c'];
    const result = this.revisionCompare.compare(
      origin,
      current,
    );

    // console.log(origin);
    // console.log(result);
    // console.log(current);

    // console.log(JSON.stringify(result));
  }

  clear(): void {
    this._previousFile = undefined;
    this._currentFile = undefined;
  }

  compare(): void {

    this.decodeContent().then(content => {
      this._editScript = this.revisionCompare.compare(content.previousContent.split('\n'), content.currentContent.split('\n'));
      console.log({editScript: this._editScript});
    });
  }

  async decodeContent() {
    if (this._previousFile && this._currentFile) {
      // console.log(this._previousFile.arrayBuffer().then(s => console.log(s)));
      // console.log(this._currentFile.arrayBuffer().toString());
      const previousUrl = URL.createObjectURL(this._previousFile);
      const currentUrl = URL.createObjectURL(this._currentFile);
      const previousContent = await fetch(previousUrl, { headers: { 'Content-Type': 'text/plain'}}).then(result => result.text());
      const currentContent = await fetch(currentUrl, { headers: { 'Content-Type': 'text/plain'} }).then(result => result.text());

      return {previousContent, currentContent};
    }

    return { previousContent: '', currentContent: ''};
  }


}
