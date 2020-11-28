import Grid from '../grid/Grid';
import './App.css';
import '../grid/Grid';

function App() {
  var elements = [];
  for (let i = 0; i < 20; i++) {
    //var color = "#" + Math.floor(Math.random()*16777215).toString(16);
    const color = `hsl(${Math.floor(Math.random() * 360)},${50 + Math.floor(Math.random() * 50)}%,${25 + Math.floor(Math.random() * 50)}%)`
    var height = 100 + Math.floor(Math.random()*1920)/4;
    var width = 100 + Math.floor(Math.random()*1920)/4;
    elements.push((
      <div style={{
        backgroundColor: color,
        height: height,
        width:width
      }}>
      </div>
    ))
    
  }
  return (
    <div className="App">
      <Grid maxWidth={window.innerWidth}>{elements}</Grid>
    </div>
  );
}

export default App;
