import { Component, Input, OnInit } from '@angular/core';
import { RevisionCompareService } from '../revision-compare.service';

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

  constructor(private revisionCompare: RevisionCompareService) { }

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

    console.log(origin);
    console.log(result);
    console.log(current);

    // console.log(JSON.stringify(result));
  }

}
