import React, { RefObject, ChangeEvent, FocusEvent, useState } from 'react';

export interface HeaderProps {
  initValue: number;
  start(initValue: number): void;
  createNewINode(newINodeType: number | string, newINodeName: string): void;
}

export const Header = (props: HeaderProps): JSX.Element => {

  let [ initValue, setInitValue ] = useState(props.initValue);
  let [ newINodeType, setNewINodeType ] = useState('');
  let [ newINodeName, setNewINodeName ] = useState('');
  let [ hasError, setError ] = useState(false);
  let [ hasINodeTypeError, setHasINodeTypeError ] = useState(false);

  const newINodeNameTypeFileRef: RefObject<HTMLLabelElement> = React.createRef();
  const newINodeNameTypeDirRef: RefObject<HTMLLabelElement> = React.createRef();

  const createNew = (): void => {
    // TODO modern notifications UX
    let hasError = false;

    if (newINodeType === '') {
      setHasINodeTypeError(true);;
      hasError = true;
    }
    if (newINodeName === '') {
      setError(true);
      hasError = true;
    }

    !hasError && props.createNewINode(newINodeType, newINodeName);
  }

  const setName = (value: string): void => {
    setNewINodeName(value);
  }
  const getClassName = (): string | undefined => hasINodeTypeError ? 'error' : undefined;

  const nameInputProps = {
    INodeName: newINodeName,
    hasError,
    onFocusINodeName: (event: FocusEvent<HTMLInputElement>): void => setError(false),
    setName
  } as INodeInputProps;

  const setType = (event: any) => {
    setNewINodeType(event.target.name);
    setHasINodeTypeError(false);
  }

  return (
    <header>
      <div>
        <p>Number of directories at root, children are decremented until empty</p>
        <button onClick={() => props.start(initValue)}>Start!</button>
        <input type="text" value={initValue} onChange={e => setInitValue(+e.target.value)} placeholder={'Directory size'}/>
      </div>
      <div>
        <label ref={newINodeNameTypeFileRef} className={getClassName()}>File</label>
        <input type="radio" name="0" checked={newINodeType === '0'} value={newINodeType} onChange={setType} />
        <label ref={newINodeNameTypeDirRef} className={getClassName()}>Dir</label>
        <input type="radio"name="1" checked={newINodeType === '1'} value={newINodeType} onChange={setType} />
        <INodeInput {...nameInputProps} />
        <button onClick={() => createNew()}>createNewINode</button>
      </div>
    </header>
  )
};

interface INodeInputProps {
  INodeName: string;
  hasError: boolean;
  setName(value: string): void;
  onFocusINodeName(event: FocusEvent<HTMLInputElement>): void;
}

const INodeInput = (props: INodeInputProps) => {
  return (
    <input
      type="text"
      value={props.INodeName}
      onFocus={props.onFocusINodeName}
      onChange={(event: ChangeEvent<HTMLInputElement>) => props.setName(event.target.value)}
      placeholder={'Directory or file name'}
      className={props.hasError ? 'error' : undefined}
    />
  )
}
