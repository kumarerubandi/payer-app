import React, { Component } from 'react';
// import DropdownCDSHook from '../components/DropdownCDSHook';
// import DropdownFrequency from '../components/DropdownFrequency';
// import DropdownTreating from '../components/DropdownTreating';
// import DropdownPayer from '../components/DropdownPayer';
// import DropdownServiceCode from '../components/DropdownServiceCode';
import DropdownDocument from '../components/DropdownDocument';
import { Input } from 'semantic-ui-react';
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

class CommunicationRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      fhirUrl: (sessionStorage.getItem('username') === 'john') ? this.props.config.provider.fhir_url : 'https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca',
      accessToken: '',
      scope: '',
      payer: '',
      patientId: sessionStorage.getItem('patientId'),
      payerId:sessionStorage.getItem('payerId'),
      practitionerId: sessionStorage.getItem('practitionerId'),
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
      documentsList:[],
      reqId:'',
      requirementSteps: [{ 'step_no': 1, 'step_str': 'Communicating with CRD system.', 'step_status': 'step_loading' },
      {
        'step_no': 2, 'step_str': 'Retrieving the required 4 FHIR resources on crd side.', 'step_status': 'step_not_started'
      },
      { 'step_no': 3, 'step_str': 'Executing HyperbaricOxygenTherapy.cql on cds server and generating requirements', 'step_status': 'step_not_started', 'step_link': 'https://github.com/mettlesolutions/coverage_determinations/blob/master/src/data/Misc/Home%20Oxygen%20Therapy/homeOxygenTherapy.cql', 'cql_name': 'homeOxygenTheraphy.cql' },
      { 'step_no': 4, 'step_str': 'Generating cards based on requirements .', 'step_status': 'step_not_started' },
      { 'step_no': 5, 'step_str': 'Retrieving Smart App', 'step_status': 'step_not_started' }],
      errors: {},
      loadingSteps: false,
      dataLoaded:false
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
    this.onPayerChange= this.onPayerChange.bind(this);
    this.onReasonChange = this.onReasonChange.bind(this);
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
    console.log(elementName,'elenAME',text)
    this.setState({ [elementName]: text });
      // this.setState({ validateIcdCode: false })
    
  }

  validateForm() {
    let formValidate = true;
    if (this.state.patientId === '') {
      formValidate = false;
      this.setState({ validatePatient: true });
    }

    if (this.state.practitionerId === '') {
      formValidate = false;
      this.setState({ validatePractitioner: true });
    }

    if (this.state.payerId === '') {
      formValidate = false;
      this.setState({ validatePayer: true });
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
        console.log("this.props.config.::",this.props.config,this.props.config.payer.fhir_url)
        const fhirClient = new Client({ baseUrl: this.props.config.payer.fhir_url });
        const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
        this.setState({ accessToken: token });
        console.log('The token is : ', token);
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
    if (this.props.config.payer.authorized_fhir) {
      fhirClient.bearerToken = this.state.accessToken;
    }
    let readResponse = await fhirClient.search({ resourceType: resourceType});
    console.log('Read Rsponse', readResponse)
    return readResponse;

  }

  async readFHIR(resourceType, resourceId) {
    const fhirClient = new Client({ baseUrl: this.props.config.payer.fhir_url });
    // if (this.props.config.payer.authorized_fhir) {
    fhirClient.bearerToken = this.state.accessToken;
    // }
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
    this.setState({ validatePractitioner: false });
  }
  onPayerChange(event) {
    this.setState({ payerId: event.target.value });
    this.setState({ validatePayer: false });
  }

  onReasonChange(event){
    this.setState({ reasons: event.target.value });
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
  redirectTo(path) {
    window.location = `${window.location.protocol}//${window.location.host}/`+path;
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

   async createFhirResource(json,resourceName) {
        //  console.log("this.state.procedure_code")
        // console.log(this.state.procedure_code)
        this.setState({ loading: true });
        
        try {
            const fhirClient = new Client({ baseUrl: this.props.config.provider.fhir_url });
            const token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
            console.log('The token is : ', token);
            fhirClient.bearerToken = token;
            fhirClient.create({
                resourceType: resourceName,
                body: json,
                headers: { "Content-Type": "application/fhir+json" }
            }).then((data) => {
                console.log("Data::",data);
                this.setState({dataLoaded:true})
                this.setState({response:data})
                this.setState({reqId:data.id})
                this.setState({ loading: false });
            }).catch((err) => {
                console.log(err);
                this.setState({ loading: false });
            })
        } catch (error) {
            console.error('Unable to create resource', error.message);
            this.setState({ loading: false });
            this.setState({dataLoaded:false})
        }

    }


  async submit_info() {

    try {
        let res_json = {}
        this.setState({dataLoaded:false,reqId:''})
        let token = await createToken(sessionStorage.getItem('username'), sessionStorage.getItem('password'));

        
        let json_request = await this.getJson();
        // let accessToken = this.state.accessToken;
        let accessToken = token;
        this.setState({accessToken});
        let patientResource = await this.readFHIR("Patient",""+this.state.patientId) 
        let practitionerResource = await this.readFHIR("Practitioner",""+this.state.practitionerId) 
        let  payerResource = await this.readFHIR("Organization",""+this.state.payerId)
        console.log(patientResource,practitionerResource,payerResource);
        let req_json = {
            "resourceType":"CommunicationRequest",
            "contained":[patientResource,practitionerResource,payerResource],
            "subject":{"reference":"#"+patientResource.id},
            "status": "active",
            "recipient": [
                    {
                        "reference": "#"+practitionerResource.id
                    }
                ],
            "sender": {
                "reference": "#"+payerResource.id
              }
          }
        let reasons = this.state.reasons.split(",")
        req_json.payload = []
        for(var i=0;i<reasons.length;i++){
          req_json.payload.push({"contentString":reasons[i]})
        }
        let documents = this.state.documents
        for(var i=0;i<documents.length;i++){
          req_json.payload.push({"contentReference":{"reference":"#"+documents[i]}})
        }

        console.log("Requestqqqq:",req_json)

        await this.createFhirResource(req_json,'CommunicationRequest')
        sessionStorage.setItem('patientId',this.state.patientId)
        sessionStorage.setItem('practitionerId',this.state.practitionerId)
        sessionStorage.setItem('payerId',this.state.payerId)
        // this.setState({ response: res_json });

    }
    catch (error) {
      console.log(error)
      this.setState({ response:error });
      this.setState({ loading: false });
      if (error instanceof TypeError) {
        this.consoleLog(error.name + ": " + error.message);
      }
      this.setState({dataLoaded:false})
    }
  }
  renderForm() {
    return (
      <React.Fragment>
        <div>
          <div className="main_heading">
            <span style={{ lineHeight: "35px" }}>Payer App - Communication Request </span>
            <div className="menu">
              <button className="menubtn"><i style={{ paddingLeft: "3px", paddingRight: "7px" }} className="fa fa-user-circle" aria-hidden="true"></i>
                {sessionStorage.getItem('name')}<i style={{ paddingLeft: "7px", paddingRight: "3px" }} className="fa fa-caret-down"></i>
              </button>
              <div className="menu-content">
                <button className="logout-btn" onClick={this.onClickLogout}>
                <i style={{ paddingLeft: "3px", paddingRight: "7px" }} className="fa fa-sign-out" aria-hidden="true"></i>Logout</button>
              </div>
            </div>
            <div className="menu_conf" onClick={() => this.redirectTo('communications')}>
              <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-comments"></i>
              Communication List</div>
            <div className="menu_conf" onClick={() => this.setRequestType('config-view')}>
              <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-cog"></i>
              Configuration
            </div>
          </div>
          <div className="content">
            <div className="left-form" style={{marginTop:"50px"}}>
                <div>
                  <div className="header">
                    Payer ID*
                      </div>
                  <div className="dropdown">
                    <Input className='ui fluid   input' type="text" name="payerId" fluid value={this.state.payerId} onChange={this.onPayerChange}></Input>

                  </div>
                  {this.state.validatePayer=== true &&
                  <div className='errorMsg dropdown'>{this.props.config.errorMsg}</div>
                  }

                </div>
                <div>
                  <div className="header">
                    Practitioner ID*
                      </div>
                  <div className="dropdown">
                    <Input className='ui fluid   input' type="text" name="practitionerId" fluid value={this.state.practitionerId} onChange={this.onPractitionerChange}></Input>

                  </div>
                  {this.state.validatePractitioner=== true &&
                  <div className='errorMsg dropdown'>{this.props.config.errorMsg}</div>
                  }
                </div>
                <div>
                    <div className="header">
                      Beneficiary ID*
                    </div>
                    <div className="dropdown">
                      <Input className='ui fluid   input' type="text" name="patient" fluid value={this.state.patientId} onChange={this.onPatientChange}></Input>
                    </div>
                    {this.state.validatePatient === true &&
                      <div className='errorMsg dropdown'>{this.props.config.errorMsg}</div>
                    }
                </div>
                <div>
                  <div className="header">
                    Reason
                  </div>
                  <div className="dropdown">
                    <Input className='ui fluid   input' type="text" name="reason" fluid value={this.state.reasons} onChange={this.onReasonChange}></Input>
                  </div>
                </div>
                <div>
                  <div className="header">
                    Documents
                  </div>
                  <div className="dropdown">
                    <DropdownDocument
                      elementName='documents'
                      updateCB={this.updateStateElement}
                     />
                  </div>
                </div>
                <div className="dropdown">
                  <button className="submit-btn btn btn-class button-ready" onClick={this.startLoading}>Submit
                      <div id="fse" className={"spinner " + (this.state.loading ? "visible" : "invisible")}>
                        <Loader
                          type="Oval"
                          color="#fff"
                          height="15"
                          width="15"
                        />
                </div>
              </button>
              </div>
            </div>
          </div>
          <div className="right-form" style={{marginTop:"50px"}}>
             {this.state.dataLoaded &&
              <div style={{textAlign:"center",paddingTop:"5%"}}>
                <p style={{color:"green"}}>{"CommunicationRequest has been created successfully with id : "+this.state.reqId+"."}</p>
              </div>
              }
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
        {this.renderForm()}
      </div>)
  }
}


function mapStateToProps(state) {
  console.log(state);
  return {
      config: state.config,
  };
};
export default withRouter(connect(mapStateToProps)(CommunicationRequest));


