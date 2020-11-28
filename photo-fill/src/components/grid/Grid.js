import React from 'react';
import './Grid.css';

function Grid({children, maxWidth}) {
    const tempChildren = [];
    
    let curX = 0;
    let curY = 0;
    let nextY = 0;

    for (let i = 0; i < children.length; i++) {
        let element = children[i];
        let width = element.props.style.width;
        let height = element.props.style.height;
        
        if (curX + width > maxWidth) {
            curX = 0;
            curY = nextY;
        }

        let newStyle = { ...element.props.style,
            position: 'absolute',
            top: curY,
            left: curX
        }

        tempChildren.push(
            React.cloneElement(element, {style:newStyle})
        );

        curX += width;
        nextY = Math.max(nextY, curY + height)
    }
  return (
    <div className="Grid">
        {tempChildren}
    </div>
  );
}

export default Grid;
