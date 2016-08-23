// PREVIEW
// ------------------------------------------------------------------------
var Preview = React.createClass({
  getTextColor: function (bg) {
    var c = bg.substring(1);     // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 50)
      return '#ecf0f1'
    else
      return '#000'
  },
  render: function () {
    var style = { backgroundColor: this.props.color
                , color: this.getTextColor(this.props.color)
                , width: 'calc(100% - 20px)'
                , height: '50px'
                , margin: '10px 10px 0px 10px'
                , lineHeight: '50px'
                , fontFamily: 'helvetica'
                , fontSize: '20px'
                , textAlign: 'center'
                };
    return <div style={style}>
             {this.props.label}: {this.props.color}
           </div>;
  }
});


// PREVIEW LIST
// ------------------------------------------------------------------------
var PreviewList = React.createClass({
  render: function () {
    var previewNodes = this.props.data.map(function (preview) {
      return (
        <Preview
          label={preview.label}
          color={preview.color}
          key={preview.id}
        />
      );
    });
    return (
      <div>
        {previewNodes}
      </div>
    );
  }
});


// PREVIEW FORM
// ------------------------------------------------------------------------
var PreviewForm = React.createClass({
  getInitialState: function () {
    return {label: '', color: ''};
  },
  handleLabelChange: function (e) {
    this.setState({label: e.target.value});
  },
  handleColorChange: function (e) {
    this.setState({color: e.target.value});
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var label = this.state.label.trim();
    var color = this.state.color.trim();
    if (!label || !color) {
      return;
    }
    if (color[0] !== '#')
      color = '#' + color;
    this.props.onSubmit({label: label, color: color});
    this.setState({label: '', color: ''});
  },
  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Label"
          value={this.state.label}
          onChange={this.handleLabelChange}
        />
        <input
          type="text"
          placeholder="#Color"
          value={this.state.color}
          onChange={this.handleColorChange}
        />
        <input type="submit" value="Add" />
      </form>
    );
  }
});


// PREVIEW BOX
// ------------------------------------------------------------------------
var PreviewBox = React.createClass({
  getInitialState: function () {
    return {data: []}
  },
  loadPreviewsFromServer: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handlePreviewSubmit: function (preview) {
    var previews = this.state.data;
    preview.id = Date.now();
    var newPreviews = previews.concat([preview]);
    this.setState({data: newPreviews});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: preview,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({data: previews});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function () {
    this.loadPreviewsFromServer();
    setInterval(this.loadPreviewsFromServer, this.props.pollInterval);
  },
  render: function () {
    return (
      <div>
        <h1>Color Previews</h1>
        <PreviewList data={this.state.data} />
        <PreviewForm onSubmit={this.handlePreviewSubmit} />
      </div>
    );
  }
});


// RENDER
// ------------------------------------------------------------------------
ReactDOM.render(
  <PreviewBox url='/api/previews' pollInterval={2000} />,
  document.getElementById('content')
);
