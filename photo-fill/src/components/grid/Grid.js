import React from 'react';
import './Grid.css';

function Grid({children}) {
    const maxWidth = 1000;
    const tempChildren = [];
    
    let curX = 0;
    let curY = 0;
    let nextY = 0;

    for (let i = 0; i < children.length; i++) {
        let element = children[i];
        let width = element.props.style.width;
        let height = element.props.style.height;
        let newStyle = { ...element.props.style,
            position: 'absolute',
            top: curY,
            left: curX
        }


        tempChildren.push(
            React.cloneElement(element, {style:newStyle})
        );

        nextY = Math.max(nextY, curY + height)
        curX += width;
        if (curX > maxWidth) {
            curX = 0;
            curY = nextY;
        }
    }
  return (
    <div className="Grid">
        <p>Hello</p>
        {tempChildren}
    </div>
  );
}

export default Grid;
