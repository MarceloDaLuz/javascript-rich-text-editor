import React, { useMemo, useState, useCallback } from "react";
import { createEditor, Transforms, Editor, Text, Node } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

const serialize = value =>{
  return (value.map(n => Node.string(n)).join('\n'));
};

const deserialize = string => {
  return string
    .split('\n')
    .map(line => {
      return { children: [{ text: line }], }
    });
};

const Leaf = props => {
  return(
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal'}}
    >
      {props.children}
    </span>
  )
}

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>
        { props.children }
      </code>
    </pre>
  );
};

const DefaultElement = props => {
  return <p {...props.attributes}> { props.children }</p>
};

const CustomEditor = {
  isBoldMarkActive(editor){
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal:true,
    })

    return !!match
  },

  isCodeBlockActive(editor){
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });
    return !!match;
  },

  toggleBoldMark(editor){
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor, 
      { bold: isActive ? null : true},
      {match: n => Text.isText(n), split: true}
    )
  },

  toggleCodeBlock(editor){
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor, 
      { type: isActive ? null : 'code'},
      { match: n => Editor.isBlock(editor, n)}
    )
  }
}

function App() {
  const editor = useMemo(() => withReact(createEditor()), []);
  //deserialize(localStorage.getItem('content')) ||
  const [value, setValue] = useState(
    deserialize(localStorage.getItem('content')) || '');

  const renderElement = useCallback(props => {
    switch(props.element.type){
      case 'code':
        return <CodeElement {...props}/>      
      default:
        return <DefaultElement {...props} />
    }
  },[]);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props}/>;
  }, []);

  return (
    <Slate 
      editor= {editor}
      value={value} 
      onChange={newValue => { 
          setValue(newValue);
          localStorage.setItem('content', serialize(newValue))

        }
      }>
        <div>
          <button
            onMouseDown={event => {
              event.preventDefault()
              CustomEditor.toggleBoldMark(editor)
            }}
          >
            Bold
          </button>
          <button
            onMouseDown={event => {
              event.preventDefault()
              CustomEditor.toggleCodeBlock(editor)
            }}
          >
            Code Block
          </button>
        </div>
        <Editable 
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if(!event.ctrlKey) return;
            switch(event.key){
              case 'c':{
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
                break;
              }
              case 'b':{
                event.preventDefault();                
                CustomEditor.toggleBoldMark(editor); 
                break;
              }
              default:
              
            }
          }}
        />
    </Slate>
  );
}



export default App;
