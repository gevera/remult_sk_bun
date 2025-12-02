import { Entity, Fields } from 'remult'

@Entity('rooms', {
  allowApiCrud: true,
})
export class Room {
  @Fields.id()
  id!: string

  @Fields.string()
  name: string = ''

  @Fields.string()
  description: string = ''

  @Fields.string()
  number: string = ''

  @Fields.string()
  location: string = ''

  @Fields.number()
  capacity: number = 0

  @Fields.string()
  type: string = ''

  @Fields.createdAt()
  createdAt?: Date

  @Fields.updatedAt()
  updatedAt?: Date

  @Fields.json()
  metadata: Record<string, any> = {}
}