import React from 'react'
import Content from './Content'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import axios from 'axios'

it('render a BigLoadign before fetch data', () => {
	const wrapper = shallow(<Content />)
	const BigLoading = wrapper.find('BigLoading')
	expect(BigLoading).toHaveLength(1)
})
