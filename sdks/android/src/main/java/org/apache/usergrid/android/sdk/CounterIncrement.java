/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.usergrid.android.sdk;

/**
 * Represents an incrementing counter, including the counter's
 * name and increment value.
 * 
 * You can use a counter when creating a number of similar 
 * Event entity instances. An Event entity's "counters" property
 * is a Map in which the key is the counter name and value is the 
 * increment value.
 */
public class CounterIncrement {

	private String counterName;
	private long counterIncrementValue;
	
	
	/**
	 * Constructs an instance, specifying the increment value
	 * as 1.
	 */
	public CounterIncrement() {
		this.counterIncrementValue = 1;
	}

	/**
	 * Constructs an instance with the specified counter name
	 * and increment value.
	 * 
	 * @param counterName The counter name.
	 * @param counterIncrementValue The counter's increment value.
	 */
	public CounterIncrement(String counterName, long counterIncrementValue) {
		this.counterName = counterName;
		this.counterIncrementValue = counterIncrementValue;
	}
	
	public String getCounterName() {
		return this.counterName;
	}
	
	public void setCounterName(String counterName) {
		this.counterName = counterName;
	}
	
	public long getCounterIncrementValue() {
		return this.counterIncrementValue;
	}
	
	public void setCounterIncrementValue(long counterIncrementValue) {
		this.counterIncrementValue = counterIncrementValue;
	}
}