# eSalWebApp - Slim php framework for back end and  using bootstrap front end

<!-- [![Build Status](https://travis-ci.org/napolux/helloslim3.svg?branch=master)](https://travis-ci.org/napolux/helloslim3) -->

A boilerplate for small PHP Projects containing the [Slim](http://www.slimframework.com/) microframework, [Twig](http://twig.sensiolabs.org/) as Template Engine and [Doctrine](http://www.doctrine-project.org/) as ORM.
If you use PHPUnit for tests, the ```/tests``` folder is there, just for you to use :P

## Features

Here are some of the eSalWebApp features...

* Admin panel (ready to be customized)
* Bootstrap integration
* Basic controller example (both web `/` and API `/api`) api still in dev
* Basic php unit tests
* env module for enviromental configurations
* User panel (ready for sal entry and modifications)

## Requirements

To run eSalWebApp you need:

* PHP 5.5.x
* A MS-Sql database located on database server
* [Composer](https://getcomposer.org/download/) & [PHPUnit](http://phpunit.en)
* [Install PHPUnit](http://phpunit.de/manual/current/en/installation.html)

## Setup

* Launch SASS watcher `sass --watch assets/sass/:public/css --style compressed`
* Create a `.env` file in the root of your project. name of file should be as follows `.env.sal` for enviromental configurations
* Change database connection credentials in `.env` if needed
* Change admin username and password in `.env` if needed
* Launch local PHP Server useing php simple server or windows iis web server folder `public/index.php`
* Go and visit `https://sal.app/` as a example

## How to launch tests locally

* Copy `.env.sal` into `.env.local_copy`
* Change credentials in `.env` according to your setup
* Run `phpunit tests/`

Legal stuff
-----------
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
