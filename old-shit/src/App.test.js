import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

it('should render without crashing', function () {
  shallow(<App />);
});

it('should render correctly', function () {
  const tree = shallow(<App />);
  expect(toJson(tree)).toMatchSnapshot();

});

it('should render Account Header', function () {
  const wrapper = shallow(<App />);
  const header = <div>Current Time</div>;
  expect(wrapper.contains(header)).toEqual(true);
});