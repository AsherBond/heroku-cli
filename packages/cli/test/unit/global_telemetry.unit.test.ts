import {expect} from '@oclif/test'
import {identity} from 'lodash'
import * as telemetry from '../../src/global_telemetry'
import * as os from 'os'

const {version} = require('../../../../packages/cli/package.json')
const nock = require('nock')

nock.disableNetConnect()

describe('telemetry', async () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  const now = new Date()
  const mockCmdStartTime = now.getTime()
  const mockOs = os.platform()
  const mockConfig = {
    platform: mockOs,
    version: version,
  }
  const mockOpts = {
    Command: {
      id: 'pipelines:open',
    },
  }
  const mockTelemetryObject = {
    command: 'pipelines:open',
    os: mockOs,
    version: version,
    exitCode: 0,
    exitState: 'successful',
    cliRunDuration: 0,
    commandRunDuration: mockCmdStartTime,
    lifecycleHookCompletion: {
      init: true,
      prerun: true,
      postrun: false,
      command_not_found: false,
    },
  }

  const setupTelemetryTest = (config: any, opts: any) => {
    const result = telemetry.setupTelemetry(config, opts)
    expect(result.command).to.equal(mockTelemetryObject.command)
    expect(result.os).to.equal(mockTelemetryObject.os)
    expect(result.version).to.equal(mockTelemetryObject.version)
    expect(result.exitCode).to.equal(mockTelemetryObject.exitCode)
    expect(result.exitState).to.equal(mockTelemetryObject.exitState)
    expect(result.cliRunDuration).to.equal(mockTelemetryObject.cliRunDuration)
    expect(result.commandRunDuration).to.greaterThan(mockTelemetryObject.commandRunDuration)
    expect(result.lifecycleHookCompletion.init).to.equal(mockTelemetryObject.lifecycleHookCompletion.init)
    expect(result.lifecycleHookCompletion.prerun).to.equal(mockTelemetryObject.lifecycleHookCompletion.prerun)
    expect(result.lifecycleHookCompletion.postrun).to.equal(mockTelemetryObject.lifecycleHookCompletion.postrun)
    expect(result.lifecycleHookCompletion.command_not_found).to.equal(mockTelemetryObject.lifecycleHookCompletion.command_not_found)
  }

  const computeDurationTest = (cmdStartTime: any) => {
    const timeDurationResult = telemetry.computeDuration(cmdStartTime)
    expect(timeDurationResult).to.greaterThan(1)
  }

  const reportCmdNotFoundTest = (config: any) => {
    mockTelemetryObject.command = 'invalid_command'
    mockTelemetryObject.exitState = 'command_not_found'
    mockTelemetryObject.commandRunDuration = 0
    mockTelemetryObject.lifecycleHookCompletion.prerun = false
    mockTelemetryObject.lifecycleHookCompletion.postrun = false
    mockTelemetryObject.lifecycleHookCompletion.command_not_found = true

    const result = telemetry.reportCmdNotFound(config)
    expect(result.command).to.equal(mockTelemetryObject.command)
    expect(result.os).to.equal(mockTelemetryObject.os)
    expect(result.version).to.equal(mockTelemetryObject.version)
    expect(result.exitCode).to.equal(mockTelemetryObject.exitCode)
    expect(result.exitState).to.equal(mockTelemetryObject.exitState)
    expect(result.cliRunDuration).to.equal(mockTelemetryObject.cliRunDuration)
    expect(result.commandRunDuration).to.equal(mockTelemetryObject.commandRunDuration)
    expect(result.lifecycleHookCompletion.init).to.equal(mockTelemetryObject.lifecycleHookCompletion.init)
    expect(result.lifecycleHookCompletion.prerun).to.equal(mockTelemetryObject.lifecycleHookCompletion.prerun)
    expect(result.lifecycleHookCompletion.postrun).to.equal(mockTelemetryObject.lifecycleHookCompletion.postrun)
    expect(result.lifecycleHookCompletion.command_not_found).to.equal(mockTelemetryObject.lifecycleHookCompletion.command_not_found)
  }

  it('confirms successful telemetry object creation', () => {
    setupTelemetryTest(mockConfig, mockOpts)
  })

  it('confirms successfully computes time duration', () => {
    computeDurationTest(mockCmdStartTime)
  })

  it('confirms successful telemetry object creation with invalid command', () => {
    reportCmdNotFoundTest(mockConfig)
  })

  it('confirms successful request to honeycomb', async () => {
    const mockTelemetry = telemetry.setupTelemetry(mockConfig, mockOpts)
    telemetry.initializeInstrumentation()

    const honeycombAPI = nock('https://api.honeycomb.io:443')
      .post('/v1/traces',  identity)
      .reply(200)

    await telemetry.sendToHoneycomb(mockTelemetry)
    honeycombAPI.done()
  })
})
