import React, { RefObject } from 'react';

// TODO abstract these
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

interface NavProps {
  list: (Directory | File)[] | null;
  iNode: Directory | File;
  selected: {};
  onSelect(id: number, dir: Directory, selected: any): void;
}
interface NavState {
  lastPosition: number;
  items: (Directory | File)[] | null;
  isOpen: boolean;
}

export class Nav extends React.Component<NavProps, NavState> {
  private readonly COUNT: number;
  private currentScrollTop: number;
  private init: boolean;
  public scrollRef: RefObject<HTMLUListElement>;
  public iconRef: RefObject<HTMLLIElement>;
  public isScrollable: boolean;
  private pinToBottom: boolean;
  
  constructor(props: NavProps) {
    super(props);

    this.scrollRef = React.createRef();
    this.iconRef = React.createRef();
    this.COUNT = 100;
    this.currentScrollTop = 20;
    this.init = false;
    this.pinToBottom = false;

    const { list } = props;

    if (list && list.length > 15) {
      this.isScrollable = true;
    }

    this.state = {
      lastPosition: 0,
      items: props.list && props.list && props.list.slice(0, this.COUNT),
      isOpen: false
    }
  }

  componentDidMount() {
    this.scrollRef.current.addEventListener('scroll', (event: Event) => this.handleScroll(event));
  }

  componentWillUnmount() {
    this.scrollRef.current.removeEventListener('scroll', (event: Event) => this.handleScroll(event));
  }

  componentDidUpdate(prevProps: NavProps, prevState: NavState) {
    // handle end of scroll list
    if (!this.pinToBottom) {
      this.scrollRef.current.scrollTop = 20;
    }
  }  

  public handleScroll(event: any): void {
    // skip the initial scrollTop assignment
    if (!this.init) {
      this.init = true;
      return;
    }
    this.pinToBottom = false;

    let scrollTop = event.srcElement.scrollTop;

    // scrolling down
    if (scrollTop > this.currentScrollTop) {
      if (scrollTop < this.currentScrollTop + 20 || this.pinToBottom) {
	return;
      }

      let { lastPosition } = this.state;

      if (lastPosition === 0) {
	this.setState({ lastPosition: 1	});
	return;
      }

      const end = lastPosition + this.COUNT
      const { list } = this.props;
      let items;

      if (end >= list.length) {
	this.pinToBottom = true;
	lastPosition = list.length - this.COUNT;
	items = list.slice(lastPosition, end);
      } else {
	items = list.slice(lastPosition, end);
	lastPosition += 1;
      }
      this.setState({
	lastPosition: lastPosition,
	items: items
      });
    }
    // scrolling up
    else if (scrollTop < this.currentScrollTop) {

      if (scrollTop < this.currentScrollTop - 20) {
	return;
      }
      let { lastPosition } = this.state;
      const end = lastPosition + this.COUNT
      const { list } = this.props;
      const items = list.slice(lastPosition, end);

      if (lastPosition === 0) {
	this.setState({
	  items: items
	});
	return;
      }
      event.srcElement.scrollTop = 20;
      this.currentScrollTop = 20;

      this.setState({
	lastPosition: lastPosition - 1,
	items: items
      });
    }
  }

  // TODO split scrolling out from prop updates
  render() {
    const { list, iNode, selected } = this.props;
    let { items } = this.state;

    // kludge for new iNode
    if (!list) {
      items = null;;
    }
    else if (Math.abs(items.length - list.length) === 1) {
      items = list;
    }

    const cName = this.isScrollable ? 'isScrollable' : null;

    return (
      <ul ref={this.scrollRef} className={cName}>
	{!list &&
	<li><em>Empty</em></li>
	}
        {items && items.map(child => (
	  <li key={child.id} ref={this.iconRef} className={`icon ${child._type === TYPES.FILE ? 'fileIcon' : (child as Directory).isOpen ? 'openIcon' : 'closeIcon'}`}>
	      <p onClick={e => this.onClick(e, child.id, child)}>{child.name}</p>
	      {selected[child.id] &&
	      <Nav
	        list={child['children']}// TS2339
	        selected={selected[child.id]}
	        onSelect={(id, children) => this.onSelected(id, children)}
	        iNode={iNode}
	      />
	      }
	    </li>
	))}
      </ul>
    );
  }

  // TODO naming
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

      if (this.state.isOpen) {
	this.iconRef.current.classList.add('openIcon');
	this.iconRef.current.classList.remove('closeIcon');
      } else {
	this.iconRef.current.classList.add('closeIcon');
	this.iconRef.current.classList.remove('openIcon');
      }
    }

    this.setState({
      isOpen: !this.state.isOpen
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
