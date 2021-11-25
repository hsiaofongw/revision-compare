import { Injectable } from '@angular/core';

/**
 * type === 'keep' means don't edit current line in A (or A[lineNumber]),
 *
 * type === 'insert' means insert B[lineNumber]
 *
 * type === 'delete' means delete A[lineNumber]
 *
 */
export type EditCommand = {
  type: 'keep' | 'insert' | 'delete';
  lineNumber: number;
  operationContent: string;
};

/**
 * A EditScript is basically something that describes "how to get to B from A",
 * where A is previous version, B is current version.
 */
export type EditScript = EditCommand[];

class Point {
  private _x = 0;
  private _y = 0;

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get k(): number {
    return this._x - this._y;
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  private _add(point: Point): Point {
    return new Point(this._x + point.x, this._y + point.y);
  }

  public static from(tuple: number[]): Point {
    return new Point(tuple[0], tuple[1]);
  }

  public add(point: Point): Point {
    return this._add(point);
  }

  public moveRight(): Point {
    return this._add(new Point(1, 0));
  }

  public moveDown(): Point {
    return this._add(new Point(0, 1));
  }

  public moveDiagonal(): Point {
    return this._add(new Point(1, 1));
  }

  public static isEqual(pointA: Point, pointB: Point): boolean {
    return pointA.x === pointB.x && pointA.y === pointB.y;
  }

  public isEqual(point: Point): boolean {
    return this._x === point.x && this._y === point.y;
  }

  public static subtract(pointA: Point, pointB: Point): Point {
    return Point.from([pointA.x-pointB.x, pointA.y-pointB.y]);
  }
}

class Station {
  private _d = 0;
  private _point!: Point;
  private _parent!: Station;

  get d(): number {
    return this._d;
  }

  get point(): Point {
    return this._point;
  }

  get parent(): Station {
    return this._parent;
  }

  get k(): number {
    return this._point.k;
  }

  constructor(d: number, point: Point, parent?: Station) {
    this._d = d;
    this._point = point;

    if (parent) {
      this._parent = parent;
    }
    else {
      this._parent = this;
    }
  }

  public clone(): Station {
    return new Station(this._d, this._point, this);
  }

  /** 返回实际移动的步数 */
  public moveDiagonal(sequencesA: string[], sequencesB: string[]): Station {
    const x = this._point.x;
    const y = this._point.y;
    if (x >= 0 && x <= sequencesA.length-1 && y>=0 && y <= sequencesA.length-1) {
      if (sequencesA[x]===sequencesB[y]) {
        return new Station(this._d, this._point.moveDiagonal(), this);
      }
    }

    return this;
  }

  /** 向下移动 */
  public moveDown(): Station {
    this._point = this._point.moveDown();
    this._d = this._d + 1;
    return this;
  }

  /** 向右移动 */
  public moveRight(): Station {
    this._point = this._point.moveRight();
    this._d = this._d + 1;
    return this;
  }

  public static removeDuplicate(stations: Station[]): Station[] {
    const stationMap: Record<string, Station> = {};
    const labelKey = (_station: Station) => `${_station.point.x},${_station.point.y}`;
    for (const station of stations) {
      const key = labelKey(station);
      if (stationMap[key] === undefined) {
        stationMap[key] = station;
      }
      else if (stationMap[key].k < station.k) {
        stationMap[key] = station;
      }
      else {

      }
    }

    const temp = new Array<Station>();
    for (const key in stationMap) {
      const station = stationMap[key];
      temp.push(station);
    }

    return temp;
  }
}

@Injectable({
  providedIn: 'root',
})
export class RevisionCompareService {

  private _retrieveEditScript(stationsPath: Station[], sequencesA: string[], sequencesB: string[]): EditScript {
    
    if (stationsPath.length === 0) {
      return [];
    }

    
    const editScript: EditScript = new Array<EditCommand>();
    const right = Point.from([1, 0]);
    const down = Point.from([0, 1]);
    const diag = Point.from([1, 1]);

    let currentStation = stationsPath.shift() as Station;
    let lineNumber = 0;
    while (stationsPath.length) {
      
      const previousStation = currentStation;
      currentStation = stationsPath.shift() as Station;
      const delta = Point.subtract(currentStation.point, previousStation.point);
      if (delta.isEqual(right)) {
        editScript.push({ type: 'delete', lineNumber: currentStation.point.x-1, operationContent: sequencesA[currentStation.point.x-1] });
      }

      if (delta.isEqual(down)) {
        editScript.push({type: 'insert', lineNumber: currentStation.point.y-1, operationContent: sequencesB[currentStation.point.y-1] });
      }

      if (delta.isEqual(diag)) {
        editScript.push({type: 'keep', lineNumber: currentStation.point.x-1, operationContent: sequencesA[currentStation.point.x-1] });
      }

      lineNumber = lineNumber+1;
    }


    return editScript;
  }
  
  private _retrieveStationsPath(station: Station): Station[] {
    // 
    let stations: Station[] = [];
    let current = station;
    let next = current.parent;
    stations.push(current);
    while (current !== next) {
      current = next;
      next = next.parent;
      stations.push(current);
    }

    // 
    stations.reverse();
    return stations;
  }

  /** tells how to get to B given A */
  public compare(sequencesA: string[], sequencesB: string[]): EditScript {
    const stations = new Array<Station[]>();
    stations.push([new Station(0, Point.from([0, 0]))]);
    let currentDPath = stations[0];
    const nRow = sequencesB.length;
    const nCol = sequencesA.length;
    const endPoint = Point.from([nCol, nRow]);
    let d = 0;
    let reachingEndPoint = true;
    let endStation: undefined | Station;
    for (let i = 0-nRow; i <= nCol && currentDPath.length && reachingEndPoint; i++) {
      currentDPath.forEach(_station => {
        if (_station.point.isEqual(endPoint)) {
          // 
          // 
          reachingEndPoint = false;
          endStation = _station;
        }
      });

      if (!reachingEndPoint) {
        continue;
      }

      let newDPaths = new Array<Station>();
      currentDPath.forEach(_station => {
        // 

        const kMinus = _station.clone().moveDown();
        const kPlus = _station.clone().moveRight();

        // 
        // 

        if (kPlus.point.x >= 0 && kPlus.point.y >= 0 && kPlus.point.x <= nCol && kPlus.point.y <= nRow) {
          newDPaths.push(kPlus);
        }

        if (kMinus.point.x >= 0 && kMinus.point.y >= 0 && kMinus.point.x <= nCol && kMinus.point.y <= nRow) {
          newDPaths.push(kMinus);
        }
      });
      newDPaths = Station.removeDuplicate(newDPaths);
      // newDPaths.forEach(_station => moveDiagonal(_station));
      for (let i = 0; i < newDPaths.length; i++) {
        newDPaths[i] = moveDiagonal(newDPaths[i]);
      }
      newDPaths = Station.removeDuplicate(newDPaths);
      
      d = d + 1;
      if (newDPaths.length) {
        stations.push(newDPaths);
      }
      currentDPath = newDPaths;

      // 
    }

    function moveDiagonal(_station: Station): Station {
      let current = _station;
      let next = _station.moveDiagonal(sequencesA, sequencesB);
      while (current !== next) {
        current = next;
        next = next.moveDiagonal(sequencesA, sequencesB);
      }
      
      return current;
    }

    
    return this._retrieveEditScript(this._retrieveStationsPath(endStation as Station), sequencesA, sequencesB);
  }
}
