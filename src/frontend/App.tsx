import React from 'react';
import { render } from 'react-dom';
import './style.css';
import { Content, FileSystem, Directory, File, TYPES, Header, HeaderProps, FileDescriptor, buildMock } from './';

interface AppState {
  node: Directory | File | null;
  selected: any;
  initValue: number;
  fileSystem: Directory[];
  newINodeType: string;
  newINodeName: string;
  //parentCount: number; /* TODO finish expando dir height */
}

interface AppProps {
  directoryCount: number;
}

export class App extends React.Component<AppProps, AppState> {

  private INIT_DIRECTORY_COUNT: number;
  //private parentCount: number;  /* TODO finish expando dir height */

  constructor(props: AppProps) {
    super(props);

    const fileSystem = buildMock(5);
    this.INIT_DIRECTORY_COUNT = props.directoryCount;
    this.state = {
      node: fileSystem[0],// TODO dependency, need to support edge cases
      selected: {},
      initValue: null,
      fileSystem: fileSystem,
      newINodeType: '',
      newINodeName: '',
      //parentCount: fileSystem.length /* TODO finish expando dir height */
    }
  }

  render() {

    const fileSystemvProps = {
      onSelect: (id: number, dir: Directory, selected: any): void => this.onSelectDirectory(dir, selected),
      list: this.state.fileSystem,
      node: this.state.node,
      selected: this.state.selected,
      //parentCount: this.state.parentCount /* TODO finish expando dir height */
    }

    const HProps: HeaderProps = {
      initValue: this.INIT_DIRECTORY_COUNT,
      initFileSystem: this.initFileSystem.bind(this),
      createNewINode: this.createNewINode.bind(this)
    }

    const { node } = this.state;

    return (
      <>
	<Header {...HProps} />
	<main>
          <div>
	    <FileSystem {...fileSystemvProps}/>
	  </div>
	  {node && (node._type === TYPES.DIR) &&
            <Content dir={node as Directory | null} />
	  }
          {node && (node._type === TYPES.FILE) &&
	    <FileDescriptor file={node as File} />
	  }
        </main>
      </>
    );
  }

  // Create new Dir | File
  public createNewINode(newINodeType: number | string, newINodeName: string): void {
    const node = { ...this.state.node };
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
    node.children ? node.children.push(newChild) : node.children = [newChild];;

    this.setState({ node });
  }

  // init new directory structure
  public initFileSystem(initValue: number): void {
    const fileSystem = buildMock(initValue);

    this.setState({
      fileSystem,
      node: fileSystem[0],
      selected: {}
      //parentCount: fileSystem.length /* TODO finish expando dir height */
    });

  }

  public onSelectDirectory(node: (Directory | File), selected: any): void {
    this.setState({
      node: node,
      selected: selected,
    });
  }
}

export function start(count: number) {
  const rootElem = document.getElementById('main');
  render(<App directoryCount={count} />, rootElem);
}
