import React, { Component } from 'react';
import { Form, TextInput } from 'components';

class HomePage extends Component {
    render() {
        return (
            <Form name="home">
                <TextInput
                    name="name"
                    required
                    placeholder="Type your name here"
                    label="Name"
                />
                <TextInput
                    name="email"
                    required
                    email
                    placeholder="Type your email here"
                    label="E-mail"
                />
            </Form>
        );
    }
}

export default HomePage;