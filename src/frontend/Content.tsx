import React, { RefObject } from 'react';
import { Directory, File, Scroller, ScrollPosition, TYPES } from './';
import { Subject } from 'rxjs';

interface ContentProps {
  dir: Directory | null;
}
interface ContentState {
  lastPosition: number;
  endPosition: number;
  items?: (Directory | File)[] | null;
}

export class Content extends React.Component<ContentProps, ContentState> {

  private scrollRef: RefObject<HTMLUListElement>;
  private readonly COUNT: number;
  private scroller: any;
  private scrollSubject: Subject<ScrollPosition>;
  private isScrollable: boolean;

  constructor(props: ContentProps) {
    super(props);

    this.COUNT = 50;
    this.scrollRef = React.createRef();
    this.scrollSubject = new Subject();
    this.scrollSubject.subscribe(nextPosition => {
      this.setState({
	lastPosition: nextPosition.start,
	endPosition: nextPosition.end
      });
    });

    const { children } = props.dir;

    if (children && children.length > 15) {
      this.isScrollable = true;
    }

    this.state = {
      lastPosition: 0,
      endPosition: this.COUNT,
    }

    this.scroller = new (Scroller as any)(this.COUNT, 20, this.scrollSubject, children.length);
  }

  shouldComponentUpdate(nextProps: ContentProps, nextState: ContentState) {
    return true;
  }

  componentDidMount() {
    this.props.dir && this.scroller.register(this.scrollRef);

    this.scrollRef.current.scrollTop = 20;
  }

  componentWillUnmount() {
    this.props.dir && this.scroller.unregister(this.scrollRef);
    this.setState({items: null});
  }

  componentDidUpdate(prevProps: ContentProps, prevState: ContentState) {
    this.scroller.didUpdate();
  }


  render() {
    const { dir } = this.props;
    const items = dir && dir.children && [...dir.children].slice(this.state.lastPosition, this.state.endPosition);
    const cName = this.isScrollable ? 'isScrollable content' : '';

    return (
      <>
	{!items &&
          <p>This Directory is Empty.</p>
	}
	{dir &&
	<section>
	  <div>
	  <ul ref={this.scrollRef} className={cName}>
          {items && items.map(inode => (
	    <li key={inode.id}>
	      <span>{inode.name}</span>
	      <span>{this.setLastModified(inode)}</span>
	    </li>
	  ))}
	  </ul>
	  </div>
	</section>
	}
      </>
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
