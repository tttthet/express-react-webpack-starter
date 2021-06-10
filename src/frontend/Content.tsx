import React, { RefObject } from 'react';
import { Directory, File, TYPES } from './';

interface ContentProps {
  dir: Directory;
}
interface ContentState {
  lastPosition: number;
  items?: (Directory | File)[] | null;
}

export class Content extends React.Component<ContentProps, ContentState> {
  public myRef: RefObject<HTMLElement>;
  private currentScrollTop: number;
  private init: boolean;
  private pinToBottom: boolean;
  private readonly COUNT: number;

  constructor(props: ContentProps) {
    super(props);

    this.COUNT = 100;
    this.currentScrollTop = 20;
    this.init = false;
    this.myRef = React.createRef();
    this.pinToBottom = false;

    this.state = {
      lastPosition: 0,
    }
  }

  shouldComponentUpdate(nextProps: ContentProps, nextState: ContentState) {
    return true;
  }

  componentDidMount() {
    this.myRef.current.addEventListener('scroll', (event: Event) => this.handleScroll(event));
  }

  componentWillUnmount() {
    this.myRef.current.removeEventListener('scroll', (event: Event) => this.handleScroll(event));
    this.setState({items: null});
  }

  componentDidUpdate(prevProps: ContentProps, prevState: ContentState) {
    // handle end of scrolling content
    if (!this.pinToBottom) {
      this.myRef.current.scrollTop = 20;
    }
  }

  public handleScroll(event: any) {
    // skip the initial scrollTop assignment
    if (!this.init) {
      this.init = true;
      return;
    }
    const { dir } = this.props;
    if (!(dir as Directory).children) {
      this.setState({ items: null });
      return;
    }
    this.pinToBottom = false;

    let scrollTop = event.srcElement.scrollTop;

    if (scrollTop > this.currentScrollTop) {

      if (scrollTop < this.currentScrollTop) {
	return;
      }

      const current = this.currentScrollTop;
      const delta = Math.floor(scrollTop / current);

      let { lastPosition } = this.state;

      if (lastPosition === 0) {
	this.setState({ lastPosition: 1 });
	return;
      }
      const end = lastPosition + this.COUNT
      if (end >= dir.children.length) {
	this.pinToBottom = true;
	lastPosition = dir.children.length - this.COUNT;
      } else {
	lastPosition += delta;
      }
      this.setState({
	lastPosition: lastPosition,
      });
    }
    else if (scrollTop < this.currentScrollTop) {

      if (scrollTop < this.currentScrollTop - 20) {
	return;
      }
      if (this.pinToBottom) {
	return;
      }

      let { lastPosition } = this.state;

      const diff = this.currentScrollTop - scrollTop;
      const delta = Math.floor((Math.abs(diff) / (this.currentScrollTop)) * 10);

      if (lastPosition === 0) {
	this.setState({
	});
	return;
      }

      const nextPosition = delta && lastPosition - delta > 0 ? lastPosition - delta : lastPosition - 1;

      this.setState({
	lastPosition: nextPosition,
      });
    }
  }

  render() {
    const { dir } = this.props;
    const items = dir.children && [...dir.children].slice(this.state.lastPosition, this.COUNT);

    return (
      <section ref={this.myRef}>
	<ul>
	{!items &&
          <p>This Directory is Empty.</p>
	  }
        {items && items.map(inode => (
	  <li key={inode.id}>
	    <span>{inode.name}</span>
	    <span>{this.setLastModified(inode)}</span>
	  </li>
	))}
        </ul>
      </section>
    );
  }

  private setLastModified(inode: Directory | File) {
    if (inode._type === TYPES.DIR && (inode as Directory).children) {
      const lastModified = (inode as Directory).children.reduce(this.lastModifiedReducer, 0);

      if (lastModified) {
	return (lastModified as Date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      }
      return '- -';
    }
    else {
      try {
	return (inode as File).lastModified.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      } catch (e) {
	return '- -';
      }
    }
  }

  private lastModifiedReducer(mostRecent: Date | number, child: any): Date | number {
    if (child !== 0 && child._type === TYPES.FILE && (+(child as File).lastModified > +mostRecent)) {
      mostRecent = (child as File).lastModified;
    }
    return mostRecent;
  };
}

/* TODO finish mobile view
interface PopupProps {
  file: File;
  close(): void;
}

export const Popup = (props: PopupProps) => {
  const { file, close } = props;

  return (
    <div className="overlay">
      <div className="popup">
        <button onClick={() => close()}>Close</button>
        <h2>{file.name}</h2>
        <p>{new Intl.DateTimeFormat().format(file.lastModified)}</p>
      </div>
    </div>
  );
};*/
