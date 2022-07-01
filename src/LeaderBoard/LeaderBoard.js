// Camper TMB and Username
function Camper(props) {
  let url = 'https://www.freecodecamp.org/' + props.name;
  return (
    <div className="camperProfile">
      <img className="camperImg" src={props.url} />
      <p className="camperName"><a href={url} target="_blank">{props.name}</a></p>
    </div>
  )
}

// Table Header w/ Buttons for recent/alltime
function TableHead(props) {
  return (
    <tr>
      <td width="5%">#</td>
      <td width="75%">Camper Name</td>
      <td width="10%">
        <button onClick={props.recent}>30 Days</button>
      </td>
      <td width="10%">
        <button onClick={props.alltime}>All Time</button>
      </td>
    </tr>
  )
}

// Individual Table Rows
class TableBody extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const url = this.props.camper.img;
    const name = this.props.camper.username;
    const recent = this.props.camper.recent;
    const allTime = this.props.camper.alltime;
    return (
      <tr>
        <td>{ this.props.index }</td>
        <td><Camper 
          url={ url } 
          name={ name }/></td>
        <td>{ recent }</td>
        <td>{ allTime }</td>
      </tr>
    );
  }
}

// Main Leaderboard
class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leaders: []
    }
    this.handleRecent = this.handleRecent.bind(this);
    this.handleAllTime = this.handleAllTime.bind(this);
  }
  
  // Start w top recents
  componentDidMount() {
    axios.get('https://fcctop100.herokuapp.com/api/fccusers/top/recent')
      .then(res => {
        this.setState({
          leaders: res.data
        })
      }).catch(error => { 
        console.log('Error: ' + error);
      });
  }
  
  // Sort by top recent
  handleRecent(e) {
    e.preventDefault();
    axios.get('https://fcctop100.herokuapp.com/api/fccusers/top/recent')
      .then(res => {
        this.setState({
          leaders: res.data
        })
      }).catch(error => { 
        console.log('Error: ' + error);
      });
  }
  
  // Sort by top alltime
  handleAllTime(e) {
    e.preventDefault();
    axios.get('https://fcctop100.herokuapp.com/api/fccusers/top/alltime')
      .then(res => {
        this.setState({
          leaders: res.data
        })
      }).catch(error => { 
        console.log('Error: ' + error);
      });
  }
  
  render() {
    const campersList = this.state.leaders;
    return (
      <div>
        <table>
          <thead>
            <TableHead 
              recent={ this.handleRecent }
              alltime={ this.handleAllTime }
              />
          </thead>
          <tbody>
            {campersList.map((camper, index) => {
              return <TableBody 
                       camper={ camper }
                       index={ index + 1 }
                       />
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

ReactDOM.render(
  <Leaderboard />,
  document.getElementById('root')
);

