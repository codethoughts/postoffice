import React, {Component} from 'react';
import {
  Button,
  Input,
  FormGroup,
  Label,
  Form,
  Table,
  Container,
  Row,
  Col,
  Badge
} from 'reactstrap';
import moment from 'moment';

export default class App extends Component {
  render() {
    const containerStyle = {
      padding: "45px 25px 25px 25px"
    }
    return (
      <Container>
        <Row>
          <Col style={containerStyle}>
            <h3>Schedule new email</h3>
            <NewEmailForm/>
          </Col>
          <Col style={containerStyle}>
            <h3>Emails</h3>
            <EmailTable/>
          </Col>
        </Row>
      </Container>
    )
  }
}

class EmailTable extends Component {
  constructor() {
    super();
    this.state = {
      data: []
    }
    this.FetchEmails = this.FetchEmails.bind(this);
  };

  FetchEmails() {
    const url = "https://email-scheduler-api.herokuapp.com/emails";
    const opts = {
      method: 'GET',
      mode: 'cors'
    };
    fetch(url, opts).then(res => res.json()).then(data => {
      this.setState({data: data.email_list});
    }).catch(err => console.error(err));
  }

  componentDidMount() {
    // start fetching data from API every 2 seconds
    this.FetchEmails();
    setInterval(this.FetchEmails, 2000)
  }

  render() {
    return (
      <Table responsive size="sm">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Subject</th>
            <th>Content</th>
            <th>Scheduled on</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((email, i) => <EmailRow key={i} data={email}/>)}
        </tbody>
      </Table>
    )
  }
}

class EmailRow extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.data.event_id}</td>
        <td>{this.props.data.subject}</td>
        <td>{this.props.data.content}</td>
        <td>{this.props.data.timestamp}</td>
        <td>{this.props.data.sent
            ? <Badge color="success" pill>Sent</Badge>
            : ""}
        </td>
      </tr>
    )
  }
}

class NewEmailForm extends Component {
  constructor() {
    super();
    this.state = {
      email: {
        event_id: "",
        email_subject: "",
        email_content: "",
        timestamp: moment().format()
      }
    }
    this.baseState = this.state;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(name, event) {
    const email = this.state.email;
    const value = event.target.value;
    email[name] = (name === 'timestamp'
      ? moment(value).toDate()
      : value);
    this.setState({email: email});
    console.log(this.state.email);
  }

  handleSubmit(event) {
    event.preventDefault();
    const esc = encodeURIComponent
    const query = Object.keys(this.state.email).map(k => esc(k) + '=' + esc(this.state.email[k])).join('&');
    const url = "https://email-scheduler-api.herokuapp.com/save_emails?" + query;
    const opts = {
      method: 'POST',
      mode: 'cors'
    }
    fetch(url, opts).then(res => res.json()).then((res) => {
      console.log(res);
      this.setState({
        email: {
          event_id: "",
          email_subject: "",
          email_content: "",
          timestamp: moment().format()
        }
      });
    }).catch(console.error);
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label for="event_id">Event ID</Label>
          <Input value={this.state.email.event_id} onChange={this.handleInputChange.bind(this, 'event_id')} type="number" min="0" name="event_id" id="event_id" required/>
        </FormGroup>
        <FormGroup>
          <Label for="subject">Subject</Label>
          <Input value={this.state.email.email_subject} onChange={this.handleInputChange.bind(this, 'email_subject')} type="text" name="subject" id="subject" required/>
        </FormGroup>
        <FormGroup>
          <Label for="content">Content</Label>
          <Input value={this.state.email.email_content} onChange={this.handleInputChange.bind(this, 'email_content')} type="textarea" name="content" id="content" required/>
        </FormGroup>
        <FormGroup>
          <Label for="timestamp">Schedule On</Label>
          <Input value={moment(this.state.email.timestamp).format("YYYY[-]MM[-]DD[T]hh:mm")} onChange={this.handleInputChange.bind(this, 'timestamp')} type="datetime-local" name="timestamp" id="timestamp" required/>
        </FormGroup>
        <Button color="primary" size="lg" block>Submit</Button>
      </Form>
    )
  }
}
