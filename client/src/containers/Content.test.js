import React from 'react'
import Content from './Content'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import axios from 'axios'

jest.mock('axios')

Enzyme.configure({ adapter: new Adapter() })

describe('<Content />', () => {
	const storyIds = {
		status: 200,
		data: new Array(500)
	}

	axios.get.mockImplementation(() => Promise.resolve(storyIds))
	axios.post.mockImplementation(() => Promise.resolve(storyIds))

	it('render a BigLoadign before fetch data', () => {
		const wrapper = shallow(<Content />)
		const BigLoading = wrapper.find('BigLoading')
		expect(BigLoading).toHaveLength(1)
	})
	it('render grid containers after loading', () => {
		const wrapper = shallow(<Content />)
		wrapper.setState({
			isLoading: false,
			idsToShow: ['id1', 'id2', 'id3']
		})
		const BigLoading = wrapper.find('GridContainer')
		expect(BigLoading).toHaveLength(3)
	})
})
