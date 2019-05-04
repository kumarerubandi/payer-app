import React, { Component } from 'react';
// import DropdownCDSHook from '../components/DropdownCDSHook';
// import DropdownFrequency from '../components/DropdownFrequency';
// import DropdownTreating from '../components/DropdownTreating';
// import DropdownPayer from '../components/DropdownPayer';
// import DropdownServiceCode from '../components/DropdownServiceCode';
// import { Input } from 'semantic-ui-react';
// import { DateInput } from 'semantic-ui-calendar-react';
import { withRouter } from 'react-router-dom';

import Client from 'fhir-kit-client';
import 'font-awesome/css/font-awesome.min.css';
import "react-datepicker/dist/react-datepicker.css";
// import DisplayBox from '../components/DisplayBox';
import 'font-awesome/css/font-awesome.min.css';
import '../index.css';
import '../components/consoleBox.css';
import Loader from 'react-loader-spinner';
// import config from '../globalConfiguration.json';
import { KEYUTIL } from 'jsrsasign';
import { createToken } from '../components/Authentication';
import { connect } from 'react-redux';


const types = {
  error: "errorClass",
  info: "infoClass",
  debug: "debugClass",
  warning: "warningClass"
}

class CommunicationHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      fhirUrl: (sessionStorage.getItem('username') === 'john') ? this.props.config.provider.fhir_url : 'https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca',
      accessToken: '',
      scope: '',
      payer: '',
      patientId: '',
      practitionerId: sessionStorage.getItem('npi'),
      resourceType: null,
      resourceTypeLT: null,
      encounterId: '',
      coverageId: '',
      encounter: null,
      request: "coverage-requirement",
      response: null,
      token: null,
      oauth: false,
      treating: null,
      loading: false,
      logs: [],
      cards: [],
      medicationInput: null,
      medication: null,
      medicationStartDate: '',
      medicationEndDate: '',
      hook: null,
      resource_records: {},
      keypair: KEYUTIL.generateKeypair('RSA', 2048),
      prior_auth: false,
      dosageAmount: null,
      color: 'grey',
      validatePatient: false,
      validateFhirUrl: false,
      validateAccessToken: false,
      validateIcdCode: false,
      req_active: 'active',
      auth_active: '',
      prefetchData: {},
      prefetch: false,
      frequency: null,
      loadCards: false,
      showMenu: false,
      service_code:"",
      category_name:"",
      communicationList:[],
      requirementSteps: [{ 'step_no': 1, 'step_str': 'Communicating with CRD system.', 'step_status': 'step_loading' },
      {
        'step_no': 2, 'step_str': 'Retrieving the required 4 FHIR resources on crd side.', 'step_status': 'step_not_started'
      },
      { 'step_no': 3, 'step_str': 'Executing HyperbaricOxygenTherapy.cql on cds server and generating requirements', 'step_status': 'step_not_started', 'step_link': 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql', 'cql_name': 'homeOxygenTheraphy.cql' },
      { 'step_no': 4, 'step_str': 'Generating cards based on requirements .', 'step_status': 'step_not_started' },
      { 'step_no': 5, 'step_str': 'Retrieving Smart App', 'step_status': 'step_not_started' }],
      errors: {},
      loadingSteps: false
    }
    this.requirementSteps = [
      { 'step_no': 1, 'step_str': 'Communicating with CRD system.', 'step_status': 'step_loading' },
      { 'step_no': 2, 'step_str': 'Fetching required FHIR resources at CRD', 'step_status': 'step_not_started' },
      { 'step_no': 3, 'step_str': 'Executing CQL at CDS and generating requirements', 'step_status': 'step_not_started', 'step_link': 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql', 'cql_name': 'homeOxygenTheraphy.cql' },
      { 'step_no': 4, 'step_str': 'Generating cards based on requirements .', 'step_status': 'step_not_started' },
      { 'step_no': 5, 'step_str': 'Retrieving Smart App', 'step_status': 'step_not_started' }];
    this.currentstep = 0;
    this.validateMap = {
      status: (foo => { return foo !== "draft" && foo !== "open" }),
      code: (foo => { return !foo.match(/^[a-z0-9]+$/i) })
    };
    this.startLoading = this.startLoading.bind(this);
    this.submit_info = this.submit_info.bind(this);
    this.onFhirUrlChange = this.onFhirUrlChange.bind(this);
    this.onAccessTokenChange = this.onAccessTokenChange.bind(this);
    this.onScopeChange = this.onScopeChange.bind(this);
    this.onEncounterChange = this.onEncounterChange.bind(this);
    this.onPatientChange = this.onPatientChange.bind(this);
    this.onPractitionerChange = this.onPractitionerChange.bind(this);
    this.changeDosageAmount = this.changeDosageAmount.bind(this);
    this.changeMedicationInput = this.changeMedicationInput.bind(this);
    this.onCoverageChange = this.onCoverageChange.bind(this);
    this.changeMedicationStDate = this.changeMedicationStDate.bind(this);
    this.changeMedicationEndDate = this.changeMedicationEndDate.bind(this);
    this.onClickLogout = this.onClickLogout.bind(this);
    this.consoleLog = this.consoleLog.bind(this);
    this.getPrefetchData = this.getPrefetchData.bind(this);
    this.readFHIR = this.readFHIR.bind(this);
    this.onClickMenu = this.onClickMenu.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }
  consoleLog(content, type) {
    let jsonContent = {
      content: content,
      type: type
    }
    this.setState(prevState => ({
      logs: [...prevState.logs, jsonContent]
    }))
  }

  updateStateElement = (elementName, text) => {
    console.log(elementName,'elenAME')

      this.setState({ [elementName]: text });
      this.setState({ validateIcdCode: false })
    
  }

  validateForm() {
    let formValidate = true;
    if (this.state.patientId === '') {
      formValidate = false;
      this.setState({ validatePatient: true });
    }
    if (this.state.hook === '' || this.state.hook === null) {
      formValidate = false;
      this.setState({ validateIcdCode: true });
    }
    return formValidate;
  }

  startLoading() {
    if (this.validateForm()) {
      this.setState({ loading: true }, () => {
        this.submit_info();
      })
    }
  }

  async componentDidMount() {
    
    try {

            // console.log("this.props.config.::",this.props.config,this.props.config.payer.fhir_url)
            const fhirClient = new Client({ baseUrl: this.props.config.payer.fhir_url });
            const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
            this.setState({ accessToken: token });
            // console.log('The token is : ', token);
            
            // let searchResponse = await fhirClient.search({ resourceType: "Communication" })
            let communicationBundle = await this.getCommunications()
            // console.log("Seacrjh ress",communicationBundle)
            if(communicationBundle.total > 0){
              this.setState({communicationList:communicationBundle.entry});
            }
        } catch (error) {

            console.log('Communication Creation failed',error);
        }

  }

  onClickMenu() {
    var showMenu = this.state.showMenu;
    this.setState({ showMenu: !showMenu });
  }

  async getAllRecords(resourceType){
    const fhirClient = new Client({ baseUrl: this.props.config.payer.fhir_url });
    // if (this.props.config.payer.authorized_fhir) {
    //   fhirClient.bearerToken = this.state.accessToken;
    // }
    fhirClient.bearerToken = this.state.accessToken;
    let readResponse = await fhirClient.search({ resourceType: resourceType});
    console.log('Read Rsponse', readResponse)
    return readResponse;

  }

   async getCommunications() {
        var tempUrl = this.props.config.payer.fhir_url;
        const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
        // console.log('The token is : ', token, tempUrl);
        const fhirResponse = await fetch(tempUrl + "/Communication?_count=100000", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            }
        }).then(response => {
            // console.log("Recieved response", response);
            return response.json();
        }).then((response) => {
            // console.log("----------response", response);
            return response;
        }).catch(reason =>
            console.log("No response recieved from the server", reason)
        );
        return fhirResponse;
    }


  async readFHIR(resourceType, resourceId) {
    const fhirClient = new Client({ baseUrl: this.props.config.payer.fhir_url });
    fhirClient.bearerToken = this.state.accessToken;
    let readResponse = await fhirClient.read({ resourceType: resourceType, id: resourceId });
    console.log('Read Rsponse', readResponse)
    return readResponse;
  }

  async getPrefetchData() {
    console.log(this.state.hook);
    var docs = [];
    if (this.state.hook === "patient-view") {
      var prefectInput = { "Patient": this.state.patientId };
    }
    else if (this.state.hook === "liver-transplant") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Practitioner": this.state.practitionerId
      }
    }
    else if (this.state.hook === "order-review") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Encounter": this.state.encounterId,
        "Practitioner": this.state.practitionerId,
        "Coverage": this.state.coverageId
      };
    } else if (this.state.hook === "medication-prescribe") {
      prefectInput = {
        "Patient": this.state.patientId,
        "Practitioner": this.state.practitionerId
      };
    }
    var self = this;
    docs.push(prefectInput);

    var prefetchData = {};
    for (var key in docs[0]) {
      var val = docs[0][key]
      if (key === 'patientId') {
        key = 'Patient';
      }
      if (val !== '') {
        prefetchData[key.toLowerCase()] = await self.readFHIR(key, val);
      }
    }
    return prefetchData;
  }

  async getResourceData(token, prefectInput) {
    console.log("Prefetch input--", JSON.stringify(prefectInput));
    const url = this.props.config.crd.crd_url + "prefetch";
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": "Bearer " + token,
      },
      body: JSON.stringify(prefectInput),
    }).then((response) => {
      return response.json();
    }).then((response) => {
      this.setState({ prefetchData: response });
    })
  }

  setRequestType(req) {
    this.setState({ request: req });
    if (req === "coverage-requirement") {
      this.setState({ auth_active: "" });
      this.setState({ req_active: "active" });
      this.setState({ hook: "" })
    }
    if (req === "patient-view") {
      this.setState({ auth_active: "active" });
      this.setState({ req_active: "" });
      this.setState({ request: "coverage-requirement" });
      this.setState({ hook: "patient-view" });
    }
    if (req === "config-view") {
      window.location = `${window.location.protocol}//${window.location.host}/configuration`;
    }
  }

  redirectTo(path) {
    window.location = `${window.location.protocol}//${window.location.host}/`+path;
  }

  setPatientView(req, res) {
    this.setState({ request: req });
    this.setState({ hook: res });
    this.setState({ auth_active: "active" });
    this.setState({ req_active: "" });
  }
  onFhirUrlChange(event) {
    this.setState({ fhirUrl: event.target.value });
    this.setState({ validateFhirUrl: false });
  }
  onAccessTokenChange(event) {
    this.setState({ accessToken: event.target.value });
    this.setState({ validateAccessToken: false });
  }
  onScopeChange(event) {
    this.setState({ scope: event.target.value });
  }
  onEncounterChange(event) {
    this.setState({ encounterId: event.target.value });
  }
  onPatientChange(event) {
    this.setState({ patientId: event.target.value });
    this.setState({ validatePatient: false });
  }
  onPractitionerChange(event) {
    this.setState({ practitionerId: event.target.value });
  }
  onCoverageChange(event) {
    this.setState({ coverageId: event.target.value });
  }
  changeMedicationInput(event) {
    this.setState({ medicationInput: event.target.value });
  }
  changeMedicationStDate = (event, { name, value }) => {

    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  }
  changeMedicationEndDate = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name))
      this.setState({ [name]: value });
  }
  changeDosageAmount(event) {
    if (event.target.value !== undefined) {
      let transformedNumber = Number(event.target.value) || 1;
      if (transformedNumber > 5) { transformedNumber = 5; }
      if (transformedNumber < 1) { transformedNumber = 1; }
      this.setState({ dosageAmount: transformedNumber });
    }

  }
  onClickLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('fhir_url');
    this.props.history.push('/login');
  }

  setSteps(index) {
    var steps = this.requirementSteps;
    if (this.state.hook === "home-oxygen-theraphy") {
      this.requirementSteps[2].step_link = 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql'
      this.requirementSteps[2].cql_name = "homeOxygenTheraphy.cql"
    }
    else if (this.state.hook === "order-review") {
      this.requirementSteps[2].cql_name = "HyperbaricOxygenTherapy.cql"
      this.requirementSteps[2].step_link = "https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/NCD/Cat1/HyperbaricOxygenTherapy/HyperbaricOxygenTherapy.cql"
    }
    if (index <= steps.length) {
      var self = this;
      setTimeout(function () {
        if (index !== 0) {
          steps[index - 1].step_status = "step_done"
        }
        console.log(index, steps[index])
        if (index !== steps.length) {
          steps[index].step_status = "step_loading"
        }
        for (var i = index + 1; i < steps.length; i++) {
          steps[i].step_status = "step_not_started"
        }
        self.setState({ requirementSteps: steps });
        if (index < steps.length) {
          if (!(self.state.patientId === 37555 && index >= 1)) {
            self.setSteps(index + 1);
            steps[index].hideLoader = false;
          }
          else {
            setTimeout(function () {
              steps[index].hideLoader = true;
              self.setState({ stepsErrorString: "Unable to generate requirements.", requirementSteps: steps });
            }, 5000)
          }
        }
        if (index === steps.length) {
          self.setState({ "loadCards": true })
        }

      }, 3000)
    }
  }

  resetSteps() {
    var steps = this.requirementSteps;
    steps[0].step_status = "step_loading"
    for (var i = 1; i < steps.length; i++) {
      steps[i].step_status = "step_not_started"
    }
    this.setState({ requirementSteps: steps, loadCards: false });
  }

  async submit_info() {
    this.setState({ loadingSteps: false, stepsErrorString: undefined });
    this.resetSteps();
    let token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
    token = "Bearer " + token;
    var myHeaders = new Headers({
      "Content-Type": "application/json",
      "authorization": token,
    });
    let json_request = await this.getJson();
    let accessToken = this.state.accessToken;
    accessToken = token;
    this.setState({accessToken});
    let url = '';
    if (this.state.request === 'coverage-requirement' && this.state.hook !== 'patient-view') {
      url = this.props.config.crd.crd_url + '' + this.props.config.crd.coverage_requirement_path;
    }
    if (this.state.hook === 'patient-view') {
      url = this.props.config.crd.crd_url + '' + this.props.config.crd.patient_view_path;
    }
    console.log("Fetching response from " + url + ",types.info")
    try {
      const fhirResponse = await fetch(url, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(json_request)
      })
      const res_json = await fhirResponse.json();
      this.setState({ response: res_json });

      if (fhirResponse && fhirResponse.status) {
        this.consoleLog("Server returned status "
          + fhirResponse.status + ": "
          + fhirResponse.error, types.error);
        this.consoleLog(fhirResponse.message, types.error);
      } else {
        this.setState({ response: res_json });
      }
      this.setState({ loading: false });
      this.setState({ "loadCards": true });
      window.scrollTo(0, 0)
    } catch (error) {
      var res_json = {
        "cards": [{
          "source": {
            "label": "CMS Medicare coverage database",
            "url": "https://www.cms.gov/medicare-coverage-database/details/ncd-details.aspx?NCDId=70&ncdver=3&bc=AAAAgAAAAAAA&\n",
          },
          "suggestions": [],
          "summary": "Requirements for Home Oxygen Theraphy",
          "indicator": "info",
          "detail": "The requested procedure needs more documentation to process further",
          "links": [{
            "url": "/index?npi=" + this.state.practitionerId,
            "type": "smart",
            "label": "SMART App"
          }]

        }]
      }
      this.setState({ response: res_json });
      this.setState({ loading: false });
      this.consoleLog("Unexpected error occured", types.error)
      if (error instanceof TypeError) {
        this.consoleLog(error.name + ": " + error.message, types.error);
      }
    }
  }
  renderCommunications() {
    return (
      <React.Fragment>
        <div>
          <div className="main_heading">
            <span style={{ lineHeight: "35px" }}>Payer App - Communications</span>
            <div className="menu">
              <button className="menubtn"><i style={{ paddingLeft: "3px", paddingRight: "7px" }} className="fa fa-user-circle" aria-hidden="true"></i>
                {sessionStorage.getItem('name')}<i style={{ paddingLeft: "7px", paddingRight: "3px" }} className="fa fa-caret-down"></i>
              </button>
              <div className="menu-content">
                <button className="logout-btn" onClick={this.onClickLogout}>
                <i style={{ paddingLeft: "3px", paddingRight: "7px" }} className="fa fa-sign-out" aria-hidden="true"></i>Logout</button>
              </div>
            </div>
            <div className="menu_conf" onClick={() => this.redirectTo('communication_request')}>
              <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-comments"></i>
              Communication Request</div>
            <div className="menu_conf" onClick={() => this.setRequestType('config-view')}>
              <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-cog"></i>
              Configuration
            </div>
           
          </div>
          <div className="content">
            <div className="left-form">
              {this.state.communicationList.map(resourceObj => (
                <div className="listItem" key={"#item"+resourceObj.resource.id}>
                  <p key={resourceObj.resource.id}>{"Id: "+resourceObj.resource.id}</p>
                  <p key={"#status"+resourceObj.resource.id}>{"Status: "+resourceObj.resource.status}</p>
                </div>

              ))}
            </div>
          </div>

        </div>
      </React.Fragment>);
  };

  async getJson() {
    var patientId = null;
    patientId = this.state.patientId;
    let coverage = {
      resource: {
        resourceType: "Coverage",
        id: this.state.coverageId,
        class: [
          {
            type: {
              system: "http://hl7.org/fhir/coverage-class",
              code: "plan"
            },
            value: "Medicare Part D"
          }
        ],
        payor: [
          {
            reference: "Organization/6"
          }
        ]
      }
    };
    let medicationJson = {
      resourceType: "MedicationOrder",
      dosageInstruction: [
        {
          doseQuantity: {
            value: this.state.dosageAmount,
            system: "http://unitsofmeasure.org",
            code: "{pill}"
          },
          timing: {
            repeat: {
              frequency: this.state.frequency,
              boundsPeriod: {
                start: this.state.medicationStartDate,
                end: this.state.medicationEndDate,
              }
            }
          }
        }
      ],
      medicationCodeableConcept: {
        text: "Pimozide 2 MG Oral Tablet [Orap]",
        coding: [
          {
            display: "Pimozide 2 MG Oral Tablet [Orap]",
            system: "http://www.nlm.nih.gov/research/umls/rxnorm",
            code: this.state.medication,
          }
        ]
      },
      reasonCodeableConcept: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: this.state.treating,
          }
        ],
        text: "Alzheimer's disease"
      }

    };
    let request = {
      hookInstance: "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
      fhirServer: this.state.fhirUrl,
      hook: this.state.hook,
      payerName: this.state.payer,
      service_code:this.state.service_code,
      fhirAuthorization: {
        "access_token": this.state.accessToken,
        "token_type": this.props.config.authorization_service.token_type, // json
        "expires_in": this.props.config.authorization_service.expires_in, // json
        "scope": this.props.config.authorization_service.scope,
        "subject": this.props.config.authorization_service.subject,
      },
      userId: this.state.practitionerId,
      patientId: patientId,
      context: {
        userId: this.state.practitionerId,
        patientId: patientId,
        coverageId: this.state.coverageId,
        encounterId: this.state.encounterId,
        orders: {
          resourceType: "Bundle",
          entry: [{
            resource: {
              resourceType: "Patient",
              id: patientId,
            }
          }
          ]
        }
      }
    };
    if (this.state.hook === 'order-review') {
      request.context.encounterId = this.state.encounterId
      request.context.orders.entry.push(coverage);
    }
    if (this.state.hook === 'medication-prescribe') {
      request.context.orders.entry.push(medicationJson);
    }
    if (this.state.prefetch) {
      var prefetchData = await this.getPrefetchData()
      this.setState({ prefetchData: prefetchData })
      request.prefetch = this.state.prefetchData;
    }
    return request;
  }
  render() {
    return (
      <div className="attributes mdl-grid">
        {this.renderCommunications()}
      </div>)
  }
}


function mapStateToProps(state) {
  console.log(state);
  return {
      config: state.config,
  };
};
export default withRouter(connect(mapStateToProps)(CommunicationHandler));


