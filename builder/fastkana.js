const path = require('path')
const fs = require('fs')

const dest = path.join(__dirname, '../assets/complex_modifications/fastkana.json')

/**
 * キーを Karabiner-Elements の設定形式にする
 * 例："Sa" = "shift + A"
 * @param {string} c
 * @returns {Object}
 */
function parseKeyDown(c) {
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
}

// name, from, to
const rules = `
きゃ	t	g S7
きゅ	g	g S8
きょ	b	g S9
しゃ	x	d S7
しゅ	d	d S8
しょ	c	d S9
ちゃ	q	a S7
ちゅ	a	a S8
ちょ	s	a S9
にゃ	u	i S7
にゅ	i	i S8
にょ	k	i S9
ひゃ	f	v S7
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
		to: part[2].split(/ /).map(parseKeyDown)
	}
})

const baseManipulator = {
	type: 'basic',
	conditions: [
		{
			type: 'input_source_if',
			input_sources: [
				{ language: '^ja$' }
			]
		}
	]
}

const simultaneous_options = {
	key_down_order: 'strict'
}

const config = {
	title: '速かな入力',
	maintainers: ['sharapeco'],
	rules: [
		{
			description: '速拗音入力 [shift + か → きゃ]',
			manipulators: [
				// 半濁音ルール
				...rules.filter(rule => /^ひ/.test(rule.name)).map(rule => ({
					...baseManipulator,
					from: {
						simultaneous: [
							{ key_code: rule.from },
							{ key_code: 'close_bracket' } // 半濁点
						],
						simultaneous_options,
						modifiers: {
							mandatory: ['shift']
						}
					},
					to: [
						rule.to[0],
						{ key_code: 'close_bracket' }, // 半濁点
						rule.to[1]
					]
				})),
				// 濁音ルール
				...rules.map(rule => ({
					...baseManipulator,
					from: {
						simultaneous: [
							{ key_code: rule.from },
							{ key_code: 'open_bracket' } // 濁点
						],
						simultaneous_options,
						modifiers: {
							mandatory: ['shift']
						}
					},
					to: [
						rule.to[0],
						{ key_code: 'open_bracket' }, // 濁点
						rule.to[1]
					]
				})),
				// 清音ルール
				...rules.map(rule => ({
					...baseManipulator,
					from: {
						key_code: rule.from,
						modifiers: {
							mandatory: ['shift']
						}
					},
					to: rule.to
				}))
			]
		}
	]
}

fs.writeFile(dest, JSON.stringify(config, null, 2), (err) => {
	if (err) {
		throw err
	}
	console.log('Done.')
})
