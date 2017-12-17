<?php

/**
 * @Author: iss_roachd
 * @Date:   2017-12-11 10:28:17
 * @Last Modified by:   iss_roachd
 * @Last Modified time: 2017-12-11 10:53:34
 */

namespace SAL\User;

class User
{

	private $firstName;
	private $lastName;
	private $username;
	private $timeipsID;
	private $assignedDivision;
	private $cellNumber;
	private $phoneNumber;

	public function __construct($user, $logger)
	{
		$this->firstName = $user->firstName;
	}
}