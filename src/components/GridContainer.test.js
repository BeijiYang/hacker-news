import React from 'react'
import GridContainer from './GridContainer'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<GridContainer />', () => {
	it('renders a Grid', () => {
		const wrapper = shallow(<GridContainer />)
		const Grid = wrapper.find('Grid')
		expect(Grid).toHaveLength(1)
	})
})