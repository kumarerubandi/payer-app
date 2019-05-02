import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

const defaultValues = [
    { key: '234', text: '#234', value: '234' },
    { key: '546', text: '#546', value: '546' },
    { key: '789', text: '#789', value: '789' }
    ]

function dropDownOptions() {
  return defaultValues.map((v) => {return {key: v.key, text: v.text, value: v.value}})
}

let blackBorder = "blackBorder";

export default class DropdownDocument extends Component {
  constructor(props){
    super(props);
    this.state = { options: dropDownOptions() ,currentValue:[]}
  };


  handleChange = (e, { value }) => {
    this.props.updateCB(this.props.elementName, value)
    this.setState({ currentValue: value })
  }


  render() {
    const { currentValue } = this.state
    if(currentValue){
        blackBorder = "blackBorder";
    }else{
        blackBorder = "";
    }
    return (
      <Dropdown
      className={"dropdownCode " +blackBorder}
        options={this.state.options}
        placeholder='Choose Code'
        search
        selection
        multiple
        fluid
        value={currentValue}
        onChange={this.handleChange}
      />
    )
  }
}