import React, { Component } from 'react';
import config_default from '../globalConfiguration.json';
import { Input } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { saveConfiguration } from '../actions/index';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';

// const NotificationContainer = window.ReactNotifications.NotificationContainer;
// const NotificationManager = window.ReactNotifications.NotificationManager;
class Configuration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config: {
                user_profiles: [
                    {
                        username: props.config.user_profiles[0].username,
                        name: props.config.user_profiles[0].name,
                        npi: props.config.user_profiles[0].npi
                    },
                    {
                        username: props.config.user_profiles[1].username,
                        name: props.config.user_profiles[1].name,
                        npi: props.config.user_profiles[1].npi
                    }
                ],
                crd: {
                    crd_url: props.config.crd.crd_url,
                    coverage_decision_path: props.config.crd.coverage_decision_path,
                    coverage_requirement_path: props.config.crd.coverage_requirement_path,
                    patient_view_path: props.config.crd.patient_view_path
                },
                payer: {
                    fhir_url: props.config.payer.fhir_url,
                    grant_type: props.config.payer.grant_type,
                    client_id : props.config.payer.client_id,
                    client_secret: props.config.payer.client_secret,
                    authorizedPayerFhir:props.config.payer.authorizedPayerFhir
                },
                provider: {
                    fhir_url: props.config.provider.fhir_url,
                    client_secret: props.config.provider.client_secret,
                    client_id: props.config.provider.client_id,
                    grant_type: props.config.provider.grant_type,
                    authorized_fhir: props.config.provider.authorized_fhir,
                    username:props.config.provider.username,
                    password:props.config.provider.password,
                    authorized_fhir: props.config.provider.authorized_fhir
                },
                authorization_service: {
                    auth_token_url: props.config.authorization_service.auth_token_url,
                    token_verification_url: props.config.authorization_service.token_verification_url,
                    token_type: props.config.authorization_service.token_type,
                    token_expires_in: props.config.authorization_service.token_expires_in,
                    scope: props.config.authorization_service.scope,
                    subject: props.config.authorization_service.subject
                },
                cds_service: {
                    vsac_user: props.config.cds_service.vsac_user,
                    vsac_password: props.config.cds_service.vsac_password
                },
                xmlx12_url: props.config.xmlx12_url,
            },
        }
        this.onChangeTokenExpiry = this.onChangeTokenExpiry.bind(this);
        this.onChangeCrdUrl = this.onChangeCrdUrl.bind(this);
        this.onChangeCoverageDecisionPath = this.onChangeCoverageDecisionPath.bind(this);
        this.onChangeCoverageRequirementPath = this.onChangeCoverageRequirementPath.bind(this);
        this.onChangePayerFhirUrl = this.onChangePayerFhirUrl.bind(this);
        this.onChangePayerClientSecret = this.onChangePayerClientSecret.bind(this);
        this.onChangePayerClientId = this.onChangePayerClientId.bind(this);
        this.onChangePayerGrantType = this.onChangePayerGrantType.bind(this);
        this.handleAPFChange = this.handleAPFChange.bind(this);
        this.onChangeProviderFhirUrl = this.onChangeProviderFhirUrl.bind(this);
        this.onChangeProviderClientSecret = this.onChangeProviderClientSecret.bind(this);
        this.onChangeProviderClientId = this.onChangeProviderClientId.bind(this);
        this.onChangeProviderGrantType = this.onChangeProviderGrantType.bind(this);
        this.onChangeAuthorizedFhir = this.onChangeAuthorizedFhir.bind(this);
        this.onChangeAuthTokenUrl = this.onChangeAuthTokenUrl.bind(this);
        this.onChangeTokenVerificationUrl = this.onChangeTokenVerificationUrl.bind(this);
        this.onChangeTokenType = this.onChangeTokenType.bind(this);
        this.onSaveConfiguration = this.onSaveConfiguration.bind(this);
        this.restToDefaults = this.restToDefaults.bind(this);
        this.goHome = this.goHome.bind(this);
        this.onChangeProviderPassword = this.onChangeProviderPassword.bind(this);
        this.onChangeProviderUsername = this.onChangeProviderUsername.bind(this);
    }

    onChangeProviderPassword(event) {
        let config = this.state.config;
        config.provider.password = event.target.value
        this.setState({ config })
    }

    onChangeProviderUsername(event) {
        let config = this.state.config;
        config.provider.username = event.target.value
        this.setState({ config })
    }


    onChangeTokenExpiry(event) {
        let config = this.state.config;
        config.tokenExpiresIn = event.target.value
        this.setState({ config })
    }
    onChangeCrdUrl(event) {
        let config = this.state.config;
        config.crd.crd_url = event.target.value
        this.setState({ config })
    }
    onChangeCoverageDecisionPath(event) {
        let config = this.state.config;
        config.crd.coverage_decision_path = event.target.value
        this.setState({ config })
    }
    onChangeCoverageRequirementPath(event) {
        let config = this.state.config;
        config.crd.coverage_requirement_path = event.target.value
        this.setState({ config })
    }
    onChangePayerFhirUrl(event) {
        let config = this.state.config;
        config.payer.fhir_url = event.target.value
        this.setState({ config })
    }
    onChangePayerGrantType(event) {
        let config = this.state.config;
        config.payer.grant_type = event.target.value
        this.setState({ config })
    }
    onChangePayerClientId(event) {
        let config = this.state.config;
        config.payer.client_id = event.target.value
        this.setState({ config })
    }
    onChangePayerClientSecret(event) {
        let config = this.state.config;
        config.payer.client_secret = event.target.value
        this.setState({ config })
    }
    handleAPFChange(event) {
        let config = this.state.config;
        config.payer.authorizedPayerFhir = event.target.checked
        console.log(event.target.checked,'check')
        this.setState({ config })
    }
    onChangeProviderFhirUrl(event) {
        let config = this.state.config;
        config.provider.fhir_url = event.target.value
        this.setState({ config })
    }
    onChangeProviderGrantType(event) {
        let config = this.state.config;
        config.provider.grant_type = event.target.value
        this.setState({ config })
    }
    onChangeProviderClientId(event) {
        let config = this.state.config;
        config.provider.client_id = event.target.value
        this.setState({ config })
    }
    onChangeProviderClientSecret(event) {
        let config = this.state.config;
        config.provider.client_secret = event.target.value
        this.setState({ config })
    }
    onChangeAuthorizedFhir(event) {
        let config = this.state.config;
        config.provider.authorized_fhir = event.target.checked
        this.setState({ config })
    }
    onChangeAuthTokenUrl(event) {
        let config = this.state.config;
        config.authorization_service.auth_token_url = event.target.value
        this.setState({ config })
    }
    onChangeTokenVerificationUrl(event) {
        let config = this.state.config;
        config.authorization_service.token_verification_url = event.target.value
        this.setState({ config })
    }
    onChangeTokenType(event) {
        let config = this.state.config;
        config.authorization_service.token_type = event.target.value
        this.setState({ config })
    }
    onSaveConfiguration() {
        let config = this.state.config;
        this.props.saveConfiguration(config);
        NotificationManager.success('Your changes have been updated successfully', 'Success');
    }
    restToDefaults() {
        this.props.saveConfiguration(config_default);
        window.location.reload();
        NotificationManager.success('Your changes have been updated successfully', 'Reset Successfull');

    }
    goHome() {
        window.location = `${window.location.protocol}//${window.location.host}/communications`;
    }
    renderConfiguration() {
        return (
            <React.Fragment>
                <div>
                    <div className="main_heading">
                        <span style={{ lineHeight: "35px" }}>Payer App - Configuration</span>
                        <div className="menu_conf" onClick={() => this.goHome()}>
                        <i style={{ paddingLeft: "5px", paddingRight: "7px" }} className="fa fa-home"></i>
                        Home</div>
                    </div>
                    <div className="content">
                        <div className="left-form">

                            {/* {config.user_profiles.map(function(user_profile, index){
                        if(user_profile.username=='john'){
                            return(<div>
                                <div className='header'>User Profile {index+1}</div>
                            <div className="leftStateInput"><div className='header-child'>Username</div>
                            <div className="dropdown"><Input className='ui input' type="text" name="username" defaultValue={user_profile.username}></Input></div></div>
                            <div className="rightStateInput"><div className='header-child'>Name</div>
                            <div className="dropdown"><Input className='ui input' type="text" name="name" defaultValue={user_profile.name}></Input></div></div>
                            <div className='header-child'>NPI</div>
                            <div className="dropdown"><Input className='ui fluid input' type="text" name="npi" fluid defaultValue={user_profile.npi}></Input></div>
                            </div>
                            )
                        }
                        else if(user_profile.username==='mary'){
                            return(<div>
                                <div className='header'>User Profile {index+1}</div>
                               <div className="leftStateInput"> <div className='header-child'>Username</div>
                               <div className="dropdown"><Input className='ui input' type="text" name="username" defaultValue={user_profile.username}></Input></div></div>
                            <div className="rightStateInput"><div className='header-child'>Name</div>
                            <div className="dropdown"><Input className='ui input' type="text" name="name" defaultValue={user_profile.name}></Input></div></div>
                            <div className='header-child'>NPI</div>
                            <div className="dropdown"><Input className='ui fluid input' type="text" name="npi" fluid defaultValue={user_profile.npi}></Input></div>
                            </div>
                            )
                        }
                        
                    })} */}
                            {/* <div className='header'>CRD</div>
                            <div className='header-child'>CRD URL</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" fluid name="crd_url"
                                    onChange={this.onChangeCrdUrl}
                                    defaultValue={this.state.config.crd.crd_url}>
                                </Input>
                            </div>

                            <div className='header-child'>Coverage Decision Path</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="coverage_decision_path"
                                    fluid onChange={this.onChangeCoverageDecisionPath}
                                    defaultValue={this.state.config.crd.coverage_decision_path}>
                                </Input>
                            </div>
                            <div className='header-child'>Coverage Requirement Path</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="coverage_requirement_path" fluid
                                    onChange={this.onChangeCoverageRequirementPath}
                                    defaultValue={this.state.config.crd.coverage_requirement_path}>
                                </Input>
                            </div> */}

                            <div className='header'>Payer FHIR URL</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" fluid name="payer_fhir_url"
                                    onChange={this.onChangePayerFhirUrl}
                                    defaultValue={this.state.config.payer.fhir_url}>
                                </Input>
                            </div>
                            <div className='header-child'>Payer Grant Type</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="payer_grant_type"
                                    onChange={this.onChangePayerGrantType} fluid
                                    defaultValue={this.state.config.payer.grant_type}>
                                </Input>
                            </div>
                            <div className='header-child'>Payer Client Secret</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="payer_client_secret"
                                    onChange={this.onChangePayerClientSecret} fluid
                                    defaultValue={this.state.config.payer.client_secret}>
                                </Input>
                            </div>
                            <div className='header-child'> Payer Client ID</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="payer_client_id" fluid
                                    onChange={this.onChangePayerClientId}
                                    defaultValue={this.state.config.payer.client_id}>
                                </Input>
                            </div>
                            <div className="header-child">Authorized Payer Fhir<input
                                            name="authorize_payer_fhir"
                                            type="checkbox"
                                            className="input-checkbox"
                                            value={this.state.config.payer.authorizedPayerFhir}
                                            checked={this.state.config.payer.authorizedPayerFhir}
                                            onChange={this.handleAPFChange} /></div>
                            {/* <div className='header'>CDS Service</div>
                    <div className="leftStateInput"><div className='header-child'>VSAC Username</div>
                    <div className="dropdown"><Input className='ui  input' type="text" name="vsac_user"  defaultValue={config.cds_service.vsac_user}></Input></div></div>
                    <div className="rightStateInput"><div className='header-child'>VSAC Password</div>
                    <div className="dropdown"><Input className='ui  input' type="text" name="vsac_password"  defaultValue={config.cds_service.vsac_password}></Input></div></div> */}
                            <div className='header'>Authorization Service</div>
                            <div className='header-child'>Authorization Token URL</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" fluid name="auth_token_url"
                                    onChange={this.onChangeAuthTokenUrl}
                                    defaultValue={this.state.config.authorization_service.auth_token_url}>
                                </Input>
                            </div>
                            <div className='header-child'>Token Verification URL</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="token_verification_url" fluid
                                    onChange={this.onChangeTokenVerificationUrl}
                                    defaultValue={this.state.config.authorization_service.token_verification_url}>
                                </Input>
                            </div>
                            <div className="leftStateInput">
                                <div className='header-child'>Token Type</div>
                                <div className="dropdown"><Input className='ui input' type="text"
                                    name="token_type" onChange={this.onChangeTokenType}
                                    defaultValue={this.state.config.authorization_service.token_type}>
                                </Input>
                                </div>
                            </div>
                            <div className="rightStateInput"><div className='header-child'>Token Expires In</div>
                                <div className="dropdown">
                                    <Input className='ui  input' type="text" name="token_expires_in"
                                        onChange={this.onChangeTokenExpiry}
                                        defaultValue={this.state.config.authorization_service.token_expires_in}>
                                    </Input>
                                </div>
                            </div>
                        </div>
                        <div className="right-form">
                            <div className='header'>Provider</div>
                            <div className='header-child'>Provider FHIR URL</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" fluid name="provider_fhir_url"
                                    onChange={this.onChangeProviderFhirUrl}
                                    defaultValue={this.state.config.provider.fhir_url}>
                                </Input>
                            </div>
                            <div className='header-child'>Username</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" fluid name="provider_username"
                                    onChange={this.onChangeProviderUsername}
                                    defaultValue={this.state.config.provider.username}>
                                </Input>
                            </div>
                            <div className='header-child'>Password</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="password" fluid name="provider_password"
                                    onChange={this.onChangeProviderPassword}
                                    defaultValue={this.state.config.provider.password}>
                                </Input>
                            </div>
                            <div className='header-child'>Provider Client Secret</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="provider_client_secret"
                                    onChange={this.onChangeProviderClientSecret} fluid
                                    defaultValue={this.state.config.provider.client_secret}>
                                </Input>
                            </div>
                            <div className='header-child'>Provider Client ID</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="provider_client_id" fluid
                                    onChange={this.onChangeProviderClientId}
                                    defaultValue={this.state.config.provider.client_id}>
                                </Input>
                            </div>
                            <div className='header-child'>Provider Grant Type</div>
                            <div className="dropdown">
                                <Input className='ui fluid input' type="text" name="provider_grant_type"
                                    onChange={this.onChangeProviderGrantType} fluid
                                    defaultValue={this.state.config.provider.grant_type}>
                                </Input>
                            </div>
                            <div className="header-child">Authorized Fhir<input
                                            name="authorize_fhir"
                                            className="input-checkbox"
                                            type="checkbox"
                                            value={this.state.config.provider.authorized_fhir}
                                            checked={this.state.config.provider.authorized_fhir}
                                            onChange={this.onChangeAuthorizedFhir} /></div>
                            <button className="submit-btn btn btn-class button-ready"
                                onClick={this.onSaveConfiguration}>Save</button>
                            <button className="btn default-btn"
                                onClick={this.restToDefaults}>Reset to defaults</button>
                        </div>
                    </div>
                    <NotificationContainer/>
                </div>
            </React.Fragment>
        )

    }

    render() {
        return (
            <div className="attributes mdl-grid">
                {this.renderConfiguration()}
            </div>)
    }

}
function mapStateToProps(state) {
    console.log(state);
    return {
        config: state.config,
    };
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        saveConfiguration
    }, dispatch);
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Configuration));