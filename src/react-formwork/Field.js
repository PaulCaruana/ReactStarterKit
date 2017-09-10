import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FieldController from './fieldController';
import SimpleList from './SimpleList';

export default ComposedComponent => class extends Component {

    static contextTypes = {
        reset: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
        values: PropTypes.object.isRequired,
        registerChild: PropTypes.func.isRequired
    };

    static propTypes = {
        name: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        label: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.string)
    };
/*

    static getProps(component, props) {
        const componentProps = {};
        const componentPropsList = Object.keys(component.propTypes);
        Object.keys(props).forEach(key => {
            if (componentPropsList.indexOf(key) > -1) {
                componentProps[key] = props[key];
            }
        });
        return componentProps;
    }
*/

    componentWillMount() {
        this.field = FieldController(this.props.name, this.props, this);
        this.form = this.context.registerChild(this.field);
    }

    componentDidMount() {
        this.field.validate(this.context.values[this.props.name]);
    }

    componentWillUnmount() {
        this.context.removeChild(this.field);
    }

    onChange(event, index, value) {
        const fieldValue = value || event.target.value
        this.context.update(this.props.name, fieldValue);
        this.field.onChange(fieldValue);
    }

    onBlur(event, index, value) {
        const fieldValue = value || event.target.value
        this.field.onBlur(fieldValue);
    }

    render() {
       //const props = this.getComponentProps(ComposedComponent);
        //console.log(props)
        return (
            <ComposedComponent
                {...this.props}
                {...this.state}
                value={this.context.values[this.props.name] || ''}
                onChange={this.onChange.bind(this)}
                onBlur={this.onBlur.bind(this)}
                errorText={SimpleList(this.field.getVisibleErrors())}
            />
        );
    }
};
