const path = require('path')
const fs = require('fs')

const dest = path.join(__dirname, '../assets/complex_modifications/fastkana.json')

// name, from, to
const rules = `
きゃ	t	g S7
きゅ	h	g S8
きょ	b	g S9
しゃ	x	d S7
しゅ	r	d S8
しょ	c	d S9
ちゃ	q	a S7
ちゅ	z	a S8
ちょ	s	a S9
にゃ	u	i S7
にゅ	1	i S8
にゅ	i	i S8
にょ	k	i S9
ひゃ	f	v S7
ひゅ	2	v S8
ひゅ	v	v S8
ひょ	hyphen	v S9
みゃ	j	n S7
みゅ	n	n S8
みょ	m	n S9
りゃ	o	l S7
りゅ	l	l S8
りょ	international1	l S9
`.split(/\n/)
.filter(s => s.trim() !== '' && s.trim().charAt(0) !== '#')
.map(line => {
	const part = line.split(/\t/)
	return {
		name: part[0],
		from: part[1],
		to: part[2].split(/ /).map(c => {
			const m = c.match(/^([ACMS]+)(.+)$/)
			const modifier = m ? m[1] : ''
			const key_code = m ? m[2] : c
			return {
				key_code,
				...(modifier === '' ? {} : {
					modifiers: [
						...(/A/.test(modifier) ? ['alt'] : []),
						...(/C/.test(modifier) ? ['control'] : []),
						...(/M/.test(modifier) ? ['command'] : []),
						...(/S/.test(modifier) ? ['shift'] : []),
					]
				})
			}
		})
	}
})

const json = {
	title: '速かな入力',
	maintainers: ['sharapeco'],
	rules: [
		{
			description: '速拗音入力 [shift + か] → きゃ',
			manipulators: rules.map(rule => ({
				type: 'basic',
				conditions: [
					{
						type: 'input_source_if',
						input_sources: [
							{ language: '^ja$' }
						]
					}
				],
				from: {
					key_code: rule.from,
					modifiers: {
						mandatory: ['shift']
					}
				},
				to: rule.to
			}))
		}
	]
	// rules: rules.map(rule => ({
	// 	description: rule.name,
	// 	manipulators: [
	// 		{
	// 			type: 'basic',
	// 			conditions: [
	// 				{
	// 					type: 'input_source_if',
	// 					input_sources: [
	// 						{ language: '^ja$' }
	// 					]
	// 				}
	// 			],
	// 			from: {
	// 				key_code: rule.from,
	// 				modifiers: {
	// 					mandatory: ['shift']
	// 				}
	// 			},
	// 			to: rule.to
	// 		}
	// 	]
	// }))
}

fs.writeFile(dest, JSON.stringify(json, null, 2), (err) => {
	if (err) {
		throw err
	}
	console.log('Done.')
})
