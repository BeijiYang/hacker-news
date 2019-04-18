import React from 'react'
import App from './App'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<App />', () => {
	it('renders without crashing', () => {
		shallow(<App />)
	})
	it('renders a Main', () => {
		const wrapper = shallow(<App />)
		const Main = wrapper.find('Main')
		expect(Main).toHaveLength(1)
	})
})
