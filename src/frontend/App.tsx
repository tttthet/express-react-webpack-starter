import React, { RefObject, ChangeEvent } from 'react';
import { render } from 'react-dom';
import './style.css';
import { Content, Nav, Directory, File, TYPES } from './';

interface AppState {
  iNode: Directory | File | null;// TODO normlalize 
  currentDirectory: Directory;// TODO normlalize 
  selected: any;// TODO type this
  initValue: number;
  fileSystem: Directory[];
  newINodeType: string;
  newINodeName: string;
}

export class App extends React.Component<{}, AppState> {

  private scrollRef: RefObject<HTMLDivElement>;
  private newINodeNameRef: RefObject<HTMLInputElement>;
  private newINodeNameTypeFileRef: RefObject<HTMLLabelElement>;
  private newINodeNameTypeDirRef: RefObject<HTMLLabelElement>;

  constructor(props: any) {
    super(props);

    const fileSystem = this.buildMock(5);

    this.scrollRef = React.createRef();
    this.newINodeNameRef = React.createRef();
    this.newINodeNameTypeFileRef = React.createRef();
    this.newINodeNameTypeDirRef = React.createRef();

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
    const navProps = {
      onSelect: (id: number, dir: Directory, selected: any) => this.onSelectDirectory(dir, selected),
      list: this.state.fileSystem,
      iNode: this.state.iNode,
      selected: this.state.selected,
    }
    const { iNode } = this.state;

    return (
      <>
	<header>
	  <div>
            <button onClick={() => this.start()}>Start!</button>
	    <input type="text" value={this.state.initValue} onChange={e => this.setState({initValue: +e.target.value})} placeholder={'Directory size'}/>
	  </div>
	  <div>
	  <label ref={this.newINodeNameTypeFileRef}>File</label>
	  <input type="radio" name="0" checked={+this.state.newINodeType === 0} value={this.state.newINodeType} onChange={(event: ChangeEvent) => this.setNewINodeType(event, 'type')} />
	  <label ref={this.newINodeNameTypeDirRef}>Dir</label>
	  <input type="radio"name="1" checked={+this.state.newINodeType === 1} value={this.state.newINodeType} onChange={(event: ChangeEvent) => this.setNewINodeType(event, 'type')} />
	  <input type="text" ref={this.newINodeNameRef} value={this.state.newINodeName} onChange={(event: ChangeEvent) => this.onInputChange(event)} placeholder={'Directory or file name'}/>
          <button onClick={() => this.createNewINode()}>createNewINode</button>
	</div>
	</header>
	<main>
          <div ref={this.scrollRef}>
	    <Nav {...navProps}/>
	  </div>
	  {iNode._type === TYPES.DIR &&
	    <Content dir={iNode as Directory} />
	  }
          {iNode._type === TYPES.FILE &&
	    <FileDesc file={iNode as File} />
	  }
        </main>
      </>
    );
  }

  private onInputChange(event: any): void {
    // sync input field
    this.setState({newINodeName: event.target.value})

    // remove error highlight
    this.newINodeNameRef.current.classList.remove('error');
  }

  private setNewINodeType(event: any, property: string): void {
    // turn off error highlights
    if (property === 'type') {
      this.newINodeNameTypeFileRef.current.classList.remove('error');
      this.newINodeNameTypeDirRef.current.classList.remove('error');
    } else {
      this.newINodeNameRef.current.classList.remove('error');
    }

    this.setState({
      newINodeType: event.target.name
    });
  }

  private createNewINode(): void {
    const { newINodeType, newINodeName } = this.state;

    // TODO modern notifications UX
    let hasError = false;
    if (newINodeType === '') {
      this.newINodeNameTypeFileRef.current.classList.add('error');
      this.newINodeNameTypeDirRef.current.classList.add('error');

      hasError = true;
    }
    if (newINodeName === '') {
      this.newINodeNameRef.current.classList.add('error');

      hasError = true;
    }
    if (hasError) {
      return;
    }

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
    iNode.children.push(newChild);

    this.setState({ iNode });
  }

  // TODO i broke it!
  public start(): void {
    const fileSystem = this.buildMock(this.state.initValue);

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

  private buildMock(init: number): Directory[] | null {
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
  }
}

const getRandomDate = (): Date => new Date(Date.now() - Math.ceil(Math.random() * 100000000000));

// TODO types
const FileDesc = (props: { file: File }) => {
  const { file } = props;
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

  return (
    <div>
      <div>
        <p>{file.name}</p>
      <p><span style={{opacity:'0.75'}}>last modified</span>{file.lastModified.toLocaleDateString("en-US", options)}</p>
      </div>
    </div>
  )
}

export function start() {
  const rootElem = document.getElementById('main');
  render(<App />, rootElem);
}
