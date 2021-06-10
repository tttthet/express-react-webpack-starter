import React, { RefObject } from 'react';
import { render } from 'react-dom';
import './style.css';
import { Content, FileSystem, Directory, File, TYPES, Header, HeaderProps, FileDescriptor, buildMock } from './';

interface AppState {
  iNode: Directory | File | null;// TODO normlalize
  currentDirectory: Directory;// TODO normlalize
  selected: any;// TODO type this
  initValue: number;
  fileSystem: Directory[];
  newINodeType: string;
  newINodeName: string;
}

export class App extends React.Component<{ directoryCount: number }, AppState> {

  private scrollRef: RefObject<HTMLDivElement>;
  private INIT_DIRECTORY_COUNT: number;

  constructor(props: any) {
    super(props);

    //const fileSystem = this.buildMock(5);
    const fileSystem = buildMock(5);
    this.INIT_DIRECTORY_COUNT = props.directoryCount;
    this.scrollRef = React.createRef();
    this.state = {
      currentDirectory: fileSystem[0] as Directory,// TODO dependency, need to support edge cases
      iNode: fileSystem[0],// TODO dependency, need to support edge cases
      selected: {},
      initValue: null,
      fileSystem: fileSystem,
      newINodeType: '',
      newINodeName: ''
    }
  }

  render() {

    const fileSystemvProps = {
      onSelect: (id: number, dir: Directory, selected: any): void => this.onSelectDirectory(dir, selected),
      list: this.state.fileSystem,
      iNode: this.state.iNode,
      selected: this.state.selected,
    }

    const HProps: HeaderProps = {
      initValue: this.INIT_DIRECTORY_COUNT,
      start: this.start.bind(this),
      createNewINode: this.createNewINode.bind(this)
    }

    const { iNode } = this.state;

    return (
      <>
	<Header {...HProps} />
	<main>
          <div ref={this.scrollRef}>
	    <FileSystem {...fileSystemvProps}/>
	  </div>
	  {iNode._type === TYPES.DIR &&
	    <Content dir={iNode as Directory} />
	  }
          {iNode._type === TYPES.FILE &&
	    <FileDescriptor file={iNode as File} />
	  }
        </main>
      </>
    );
  }

  public createNewINode(newINodeType: number | string, newINodeName: string): void {

    // Create new Dir | File
    const iNode = { ...this.state.iNode };
    let newChild: Directory | File;

    if (+newINodeType === TYPES.DIR) {
      newChild = {
	id: Date.now(),
	name: newINodeName,
	children: null,
	_type: TYPES.DIR
      } as Directory;
    } else {
      newChild = {
	id: Date.now(),
	name: newINodeName,
	lastModified: new Date(),
	_type: TYPES.FILE
      } as File;
    }
    iNode.children ? iNode.children.push(newChild) : iNode.children = [newChild];;

    this.setState({ iNode });
  }

  // TODO i broke it!
  public start(initValue: number): void {
    //const fileSystem = this.buildMock(this.INIT_DIRECTORY_COUNT);
    const fileSystem = buildMock(initValue);

    console.log('stat', initValue);
    console.log('fileSystem', fileSystem);

    this.setState({fileSystem});
  }

  // TODO type 'dir' param
  public onSelectDirectory(iNode: (Directory | File), selected: any): void {
    this.setState({
      currentDirectory: iNode as Directory,
      iNode: iNode,
      selected: selected,
    });
  }

/*  private buildMock(initValue: number): Directory[] | null {
    let k = 0;

    function lots(begin: number) {
      const items = []

      for (let i = 0; i <= 299; i++) {
	items.push({
	  id: begin + i,
	  name: 'file' + begin + i,
	  _type: TYPES.FILE,
	  lastModified: getRandomDate()
	});
      }

      return items;
    }

    return (function build(i: number): Directory[] | null {
      if (!i) return null;

      return [...Array(i).keys()].reverse().map(j => {
	k++;

	if (j % 2) {
	  return {
	    id: k,
	    name: 'file' + k,
	    _type: TYPES.FILE,
	    lastModified: getRandomDate()
	  }
	} else {
	  return {
	    id: k,
	    name: 'dir' + k,
	    _type: TYPES.DIR,
	    children: i-- === init ? lots(k) : build(i),
	    isOpen: false
	  }
	}
      });
    })(init);
  }*/
}

export function start(count: number) {
  const rootElem = document.getElementById('main');
  render(<App directoryCount={count} />, rootElem);
}
