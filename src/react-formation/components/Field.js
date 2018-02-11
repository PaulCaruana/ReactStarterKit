import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FieldController from './controllers/field';
import SimpleList from './SimpleList';
import mapProps from '../mapProps';
import rootProps from '../rootProps';
import equals from 'shallow-equals';
import debounce from 'lodash.debounce';


export default (BaseComponent, mapper = null) => class extends Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onDebounce = debounce(function(event, value) {
            this.onPostChangeInternal(event, value);
        }, this.props.debounce);
        this.onPostChange = (this.props.debounce) ? this.onDebounce : this.onPostChangeInternal;
        const basePropNames = Object.keys(BaseComponent.propTypes) || [];
        const mappedPropNames = Object.keys(mapper) || [];
        this.basePropNames = basePropNames.concat(mappedPropNames).concat(rootProps);
    }

    componentWillMount() {
        this.type = (mapper)? mapper.type : null;
        const { ...props } = this.props;
        props.type = this.type;
        this.field = FieldController(this.props.name, props, this);
        this.form = this.context.registerChild(this.field);
        const defaultValue = this.props.defaultValue || this.props.defaultChecked;
        if (defaultValue !== undefined
            && this.context.values[this.props.name] === undefined) {
            this.context.update(this.props.name, defaultValue);
        }
        this.field.validate(this.context.values[this.props.name]);
        this.customProps = Object.keys(this.context.config.validators);
    }

    componentWillUnmount() {
        this.form.removeChild(this.field);
    }

    shouldComponentUpdate(newProps, newState) {
        return (this.field.$renderPending
        || !equals(this.props, newProps)
        || !equals(this.state, newState));
    }

    get value() {
        return this.context.values[this.props.name] || '';
    }

    onChange(event, value) {
        const validInput = (event && event.target && event.target.validity)
            ? event.target.validity.valid : true;
        const fieldValue = (value !== undefined) ? value : event.target.value;
        if (validInput) {
            this.context.update(this.props.name, fieldValue);
            this.field.$renderPending = true;
            this.onPostChange(event, fieldValue);
        }
    }

    onBlur(event, value) {
        const fieldValue = value || (event && event.target.value) || null;
        this.field.onBlur(fieldValue);
    }

    get errors() {
        return SimpleList(this.field.getVisibleErrors());
    }

    onToggle(event, value) {
        this.onChange(event, value);
    }

    onPostChangeInternal(event, value) {
        this.field.onChange(value);
    }

    render() {
        // Load Model View Props
        const formProps = this.props;
        const composedProps = {
            value: this.value,
            onChange: this.onChange,
            onBlur: this.onBlur,
            errorText: this.errors,
            ...formProps
        };

        // Get base properties
        const allProps = (mapper) ? mapProps(composedProps, mapper, this) : composedProps;
        const baseComponentProps = Object.keys(allProps).reduce((obj, propName) => {
            if (this.basePropNames.indexOf(propName) > -1
                && this.customProps.indexOf(propName) === -1) {
                obj[propName] = allProps[propName];
            }
            return obj;
        }, {});

        this.field.$renderPending = false;
        return (
            <div>
                <BaseComponent {...baseComponentProps} />
            </div>
        );
    }

    static contextTypes = {
        reset: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
        formStatus: PropTypes.func.isRequired,
        values: PropTypes.object.isRequired,
        registerChild: PropTypes.func.isRequired,
        config: PropTypes.object
    };

    static propTypes = {
        name: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        label: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.string)
    };
};
