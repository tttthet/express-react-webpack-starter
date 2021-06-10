import * as React from 'react';
import { File } from './';

interface Props {
  file: File
}

export const FileDescriptor = (props: Props) => {
  const { file } = props;

  return (
    <div>
      <div>
        <div className={'file-context'}>
          <div className={'icon fileIconasGraphic'}></div>
        </div>
        <p>{file.name}</p>
        <p><span style={{opacity:'0.75'}}>last modified</span>{file.lastModified.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}</p>
      </div>
    </div>
  )
}
