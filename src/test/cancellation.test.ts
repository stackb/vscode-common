/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CancellationToken, CancellationTokenSource } from '../cancellation';

describe('CancellationToken', function () {

	it('None', () => {
		assert.equal(CancellationToken.None.isCancellationRequested, false);
		assert.equal(typeof CancellationToken.None.onCancellationRequested, 'function');
	});

	it('cancel before token', function (done) {

		const source = new CancellationTokenSource();
		assert.equal(source.token.isCancellationRequested, false);
		source.cancel();

		assert.equal(source.token.isCancellationRequested, true);

		source.token.onCancellationRequested(function () {
			assert.ok(true);
			done();
		});
	});

	it('cancel happens only once', function () {

		let source = new CancellationTokenSource();
		assert.equal(source.token.isCancellationRequested, false);

		let cancelCount = 0;
		function onCancel() {
			cancelCount += 1;
		}

		source.token.onCancellationRequested(onCancel);

		source.cancel();
		source.cancel();

		assert.equal(cancelCount, 1);
	});

	it('cancel calls all listeners', function () {

		let count = 0;

		let source = new CancellationTokenSource();
		source.token.onCancellationRequested(function () {
			count += 1;
		});
		source.token.onCancellationRequested(function () {
			count += 1;
		});
		source.token.onCancellationRequested(function () {
			count += 1;
		});

		source.cancel();
		assert.equal(count, 3);
	});

	it('token stays the same', function () {

		let source = new CancellationTokenSource();
		let token = source.token;
		assert.ok(token === source.token); // doesn't change on get

		source.cancel();
		assert.ok(token === source.token); // doesn't change after cancel

		source.cancel();
		assert.ok(token === source.token); // doesn't change after 2nd cancel

		source = new CancellationTokenSource();
		source.cancel();
		token = source.token;
		assert.ok(token === source.token); // doesn't change on get
	});

	it('dispose calls no listeners', function () {

		let count = 0;

		let source = new CancellationTokenSource();
		source.token.onCancellationRequested(function () {
			count += 1;
		});

		source.dispose();
		source.cancel();
		assert.equal(count, 0);
	});

	it('dispose calls no listeners (unless told to cancel)', function () {

		let count = 0;

		let source = new CancellationTokenSource();
		source.token.onCancellationRequested(function () {
			count += 1;
		});

		source.dispose(true);
		// source.cancel();
		assert.equal(count, 1);
	});

	it('parent cancels child', function () {

		let parent = new CancellationTokenSource();
		let child = new CancellationTokenSource(parent.token);

		let count = 0;
		child.token.onCancellationRequested(() => count += 1);

		parent.cancel();

		assert.equal(count, 1);
		assert.equal(child.token.isCancellationRequested, true);
		assert.equal(parent.token.isCancellationRequested, true);
	});
});