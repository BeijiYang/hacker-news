import React from 'react'
import GridContainer from './GridContainer'
import Grid from '../components/Grid'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<GridContainer />', () => {
	it('renders a Loading', () => {
		const wrapper = shallow(<GridContainer />)
		const Loading = wrapper.find('Loading')
		expect(Loading).toHaveLength(1)
	})
	it('renders a Grid after receive props', () => {
		const wrapper = shallow(<GridContainer />)
		wrapper.setProps({ title: 'some title' })
		const Grid = wrapper.find('Grid')
		expect(Grid).toHaveLength(1)
	})
	it('class name changes onClick', () => {
		const wrapper = mount(<GridContainer />)
		wrapper.setProps({ title: 'some title' })
		const gridClassListBeforeClick = Object.values(wrapper.instance()['grid']['classList'])
		wrapper.find('.grid-wrap').simulate('click')
		const gridClassListAfterClick = Object.values(wrapper.instance()['grid']['classList'])
		expect(gridClassListBeforeClick.includes('expand')).toBe(false)
		expect(gridClassListAfterClick.includes('expand')).toBe(true)
	})
	it('class name does not change onClick url', () => {
		const wrapper = mount(<GridContainer />)
		wrapper.setProps({ title: 'some title' })
		const gridClassListBeforeClick = Object.values(wrapper.instance()['grid']['classList'])
		wrapper.find('.grid-url').simulate('click')
		const gridClassListAfterClick = Object.values(wrapper.instance()['grid']['classList'])
		expect(gridClassListBeforeClick.includes('expand')).toBe(false)
		expect(gridClassListAfterClick.includes('expand')).toBe(false)
	})
})
