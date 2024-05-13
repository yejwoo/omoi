import React from 'react';
import {useDropzone} from 'react-dropzone';
import { FileWithPath } from "file-selector";


export default function Dropzone(props: any) {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
    accept: {
      'image/jpg': [],
      'image/jpeg': [],
      'image/png': [],
    }
  });
  
  const files = acceptedFiles.map((file: FileWithPath) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>사진을 끌어다 놓으세요.</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  );
}
