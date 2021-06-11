import React, { RefObject } from 'react';
import { Scroller, ScrollPosition } from './';
import { Subject } from 'rxjs';

export interface Directory {
  id: number;
  name: string;
  _type: TYPES;
  children?: Array<Directory | File> | null;
  isOpen?: boolean;
}

export interface File {
  id: number;
  name: string;
  _type: TYPES;
  lastModified: Date;
  children?: undefined;// TODO fix kludge for TS2339
}

export const enum TYPES {
  FILE,
  DIR
}

interface FileSystemProps {
  list: (Directory | File)[] | null;
  node: Directory | File;
  selected: {};
  //parentCount: number | null; /* TODO finish expando dir height */
  onSelect(id: number, dir: Directory, selected: any): void;
}

interface FileSystemState {
  lastPosition: number;
  endPosition: number;
  isDirectoryOpen: boolean;
}

export class FileSystem extends React.Component<FileSystemProps, FileSystemState> {

  private readonly COUNT: number;
  private scroller: any;
  private scrollSubject: Subject<ScrollPosition>;
  //private myObserver; /* TODO finish expando dir height */

  public scrollRef: RefObject<HTMLUListElement>;
  public isScrollable: boolean;

  constructor(props: FileSystemProps) {
    super(props);

    this.scrollRef = React.createRef();
    this.COUNT = 50;
    this.scrollSubject = new Subject();
    this.scrollSubject.subscribe(nextPosition => {
      this.setState({
	lastPosition: nextPosition.start,
	endPosition: nextPosition.end
      });
    });

    const { list } = props;

    // TODO abstract the constant
    if (list && list.length > 15) {
      this.isScrollable = true;
    }

    this.scroller = new (Scroller as any)(this.COUNT, 20, this.scrollSubject, list.length);

    /* TODO finish expando dir height
    this.myObserver = new ResizeObserver(entries => {
      console.log('resize', entries);
    });*/

    this.state = {
      lastPosition: 0,
      endPosition: this.COUNT,
      isDirectoryOpen: false
    }
  }

  componentDidMount() {
    this.scroller.register(this.scrollRef);

    /* TODO finish expando dir height
    if (this.props.parentCount) {
      console.log('this.scrollRef.current', this.scrollRef.current);
      console.log('query', document.querySelector('main > div:first-child'));
      console.log('query height', document.querySelector('main > div:first-child').clientHeight);
      //console.log('this.scrollRef.parentElement.parentElement', this.scrollRef.parentElement.parentElement);
      //console.log('this.scrollRef.parentElement.parentElement.parentElement', this.scrollRef.parentElement.parentElement.parentElement);

      //this.scrollRef.current.style.height = document.querySelector('main > div:first-child').clientHeight - (this.props.parentCount * 20) + 'px';
      let c = window.getComputedStyle(this.scrollRef.current);
      this.containerHeight = +c.height.split('px')[0];
      console.log('c', this.containerHeight);
      this.scrollRef.current.style.height = (document.querySelector('main > div:first-child').clientHeight - this.containerHeight) + 'px';
      //this.myObserver.observe(this.scrollRef.current);
    }*/
  }

  componentWillUnmount() {
    this.scroller.unregister(this.scrollRef);
  }

  componentDidUpdate(prevProps: FileSystemProps, prevState: FileSystemState) {
    this.scroller.didUpdate();
  }

  render() {
    const { list, node, selected } = this.props;

    let items: (Directory | File)[];
    let cName: string;

    // new node
    if (list && node) {
      for (let i = 0; i < list.length; i++) {
	let item = list[i];
	if (item.id === node.id) {
	  item.children = node.children;
	  break;
	}
      }

      items = list && list.slice(this.state.lastPosition, this.state.endPosition);
      cName = this.isScrollable ? 'isScrollable filesystem' : null;
    }

    return (
      <ul ref={this.scrollRef} className={cName}>
	{!list &&
	<li><em>Empty</em></li>
	}
        {items && items.map(child => (
	  <li key={child.id} className={`icon ${child._type === TYPES.FILE ? 'fileIcon' : (child as Directory).isOpen ? 'openIcon' : 'closeIcon'}`}>
	    <p onClick={e => this.onClick(e, child.id, child)}>{child.name}</p>
	      {selected[child.id] &&
	    <FileSystem
	      list={child['children']}// TS2339
	      selected={selected[child.id]}
	      onSelect={(id, children) => this.onSelected(id, children)}
	      node={node}
	    />
	    }
	  </li>
	))}
      </ul>
    );
  }

  public onSelected(id: number, child: Directory | File): void {
    const { selected, onSelect } = this.props;

    selected[id] = child;
    onSelect(id, child, selected);
    this.isScrollable = false;
  }

  public onClick(event: React.MouseEvent<Element>, id: number, child: Directory | File): void {
    event.stopPropagation();

    if (child._type === TYPES.DIR) {
      child = child as Directory;
      child.isOpen = !child.isOpen;
    }

    this.setState({
      isDirectoryOpen: !this.state.isDirectoryOpen
    })

    const { selected, onSelect } = this.props;
    if (child._type === TYPES.FILE) {
      onSelect(id, child, selected);

      return;
    }

    if (selected[id]) {
      delete selected[id];
    } else {
      selected[id] = {};
    }

    onSelect(id, child, selected);
  }
}
