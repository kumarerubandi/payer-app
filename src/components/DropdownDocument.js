import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

const defaultValues =[
  { 'code': '34117-2', 'text': 'History and Physical Note' },
  { 'code': '11506-3', 'text': 'Progress Note' },
  { 'code': '57133-1', 'text': 'Referral Note' },
  { 'code': '11488-4', 'text': 'Consultation Note' },
  { 'code': '28570-0', 'text': 'Procedure Note' },
  { 'code': '18776-5', 'text': 'Care Plan' },
  { 'code': '34133-9', 'text': 'Continuity of Care Document' }
  ];

function dropDownOptions() {
  return defaultValues.map((v) => {return {code: v.code, text: v.text}})
}

let blackBorder = "blackBorder";

export default class DropdownDocument extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
 
  };

  handleChange = (e, { code }) => {
    console.log(this.props,code);
    this.props.updateCB(this.props.elementName, code)
    this.setState({ currentValue: code })
  }

  render() {
    console.log("this.state",this.state);
    const { currentValue } = this.state;
    if(currentValue){
        blackBorder = "blackBorder";
    }else{
        blackBorder = "";
    }
    return (
      <Dropdown
      className={blackBorder}
        options={defaultValues}
        placeholder='Select Document'
        search
        selection
        fluid
        
        onChange={this.handleChange}
      />
    )
  }
}