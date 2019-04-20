import React from 'react'
import Grid from './Grid'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<Grid />', () => {
	it('test handleClick event onClick Grid', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ handleClick: jest.fn() })
		wrapper.simulate('click')
		const handleClick = wrapper.props()['handleClick']
		expect(handleClick).toHaveBeenCalled()
	})
	it('test handleClickUrl event onClick url', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ handleClickUrl: jest.fn() })
		wrapper.find('.grid-url').simulate('click')
		const handleClickUrl = wrapper.props()['handleClickUrl']
		expect(handleClickUrl).toHaveBeenCalled()
	})
	it('should render score number correctly', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ score: 999 })
		const score = wrapper.find('.grid-score-number').text()
		expect(score).toBe('999')
	})
	it('should render title correctly', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ title: 'fake title' })
		const title = wrapper.find('.grid-title').text()
		expect(title).toBe("fake title")
	})
	it('should render author correctly', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ by: 'fake author' })
		const by = wrapper.find('.grid-by').text()
		expect(by).toBe('By fake author')
	})
	it('should render preview text correctly', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ text: 'fake preview text' })
		const text = wrapper.find('.grid-text').text()
		expect(text).toBe('fake preview text')
	})
	it('should render url correctly', () => {
		const wrapper = mount(<Grid />)
		wrapper.setProps({ url: 'fake url' })
		const url = wrapper.find('.grid-url').props().href
		expect(url).toBe('fake url')
	})
})