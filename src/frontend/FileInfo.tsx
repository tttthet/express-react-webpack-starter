import * as React from 'react';
import { File } from './';

interface Props {
  file: File
}

export const FileDesc = (props: Props) => {
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
