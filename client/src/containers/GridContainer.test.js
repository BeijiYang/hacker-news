import React from 'react'
import GridContainer from './GridContainer'
import Grid from './Grid'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
// import 'jsdom-global/register'

Enzyme.configure({ adapter: new Adapter() })

describe('<GridContainer />', () => {
	it('renders a Grid', () => {
		const wrapper = shallow(<GridContainer />)
		const Grid = wrapper.find('Grid')
		expect(Grid).toHaveLength(1)
	})
})